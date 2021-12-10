import { AdminApiClient, HaloRestAPIClient } from "@halo-dev/admin-api";
import { getLocalStorageItem, getPreferenceValues, setLocalStorageItem, showToast, ToastStyle } from "@raycast/api";
import axios, { AxiosError, AxiosPromise, AxiosRequestConfig } from "axios";

const preferenceValues = getPreferenceValues();
const siteUrl = preferenceValues.siteurl as string;
const username = preferenceValues.username as string;
const password = preferenceValues.password as string;

const haloRestApiClient = new HaloRestAPIClient({
  baseUrl: siteUrl,
});

const apiClient = new AdminApiClient(haloRestApiClient);

haloRestApiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const token = await getLocalStorageItem<string>("token");
    if (token) {
      config.headers = {
        "Admin-Authorization": token,
      };
      return config;
    }

    await apiClient.login({ username, password });
    return axios(config);
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshingToken = false;
let pendingRequests: Array<() => AxiosPromise<void>> = [];

haloRestApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (/Network Error/.test(error.message)) {
      await showToast(ToastStyle.Failure, "Error", "Network Error");
      return Promise.reject(error);
    }

    const refreshToken: string | undefined = await getLocalStorageItem<string>("refresh_token");
    const originalRequest = error.config;

    const response = error.response;

    const data = response ? response.data : null;

    if (data) {
      if (data.status === 400) {
        await showToast(ToastStyle.Failure, "Error", data.message);
        return Promise.reject(error);
      }
      if (data.status === 401) {
        if (!isRefreshingToken) {
          isRefreshingToken = true;
          try {
            await handleRefreshToken(refreshToken);

            pendingRequests.forEach((callback) => callback());
            pendingRequests = [];

            return axios(originalRequest);
          } catch (e) {
            await handleLogin();
            return axios(originalRequest);
          } finally {
            isRefreshingToken = false;
          }
        } else {
          pendingRequests.push((): AxiosPromise<void> => {
            return axios(originalRequest);
          });
          return Promise.reject(error);
        }
      }
      await showToast(ToastStyle.Failure, "Error", data.message || "Internal Server Error");
      return Promise.reject(error);
    }

    await showToast(ToastStyle.Failure, "Error", "Network Error");
    return Promise.reject(error);
  }
);

async function handleRefreshToken(refreshToken: string | undefined) {
  if (refreshToken) {
    const { data } = await apiClient.refreshToken(refreshToken);
    await setLocalStorageItem("token", data.access_token);
    await setLocalStorageItem("refresh_token", data.refresh_token);
  } else {
    throw new Error("refresh token is empty");
  }
}

async function handleLogin() {
  try {
    const { data } = await apiClient.login({ username, password });
    await setLocalStorageItem("token", data.access_token);
    await setLocalStorageItem("refresh_token", data.refresh_token);
  } catch (e) {
    console.log(e);
    // TODO: reconfigure username and password
  }
}

export default apiClient;

export { haloRestApiClient };
