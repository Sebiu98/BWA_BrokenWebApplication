const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

type ApiValidationErrors = Record<string, string[]>;

export class ApiRequestError extends Error {
  status: number;
  errors?: ApiValidationErrors;

  constructor(message: string, status: number, errors?: ApiValidationErrors) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

export type ApiCategory = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
};

type ApiProduct = {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number | string;
  discount_percentage?: number;
  is_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  category?: ApiCategory;
};

export type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage: number;
  category: string;
  platform: string;
  rating: number;
  image: string;
};

export type ApiAdminProduct = {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number | string;
  discount_percentage: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
  category?: ApiCategory;
};

const buildApiRequestError = async (
  response: Response,
): Promise<ApiRequestError> => {
  let message = `API request failed: ${response.status} ${response.statusText}`;
  let errors: ApiValidationErrors | undefined;

  try {
    const payload = (await response.json()) as {
      message?: string;
      errors?: ApiValidationErrors;
    };
    if (payload.message) {
      message = payload.message;
    }
    if (payload.errors) {
      errors = payload.errors;
    }
  } catch {
    // Ignora body non JSON.
  }

  return new ApiRequestError(message, response.status, errors);
};

const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw await buildApiRequestError(response);
  }

  return response.json() as Promise<T>;
};

const mapApiProductToCatalogProduct = (item: ApiProduct): CatalogProduct => {
  const basePrice = Number(item.price);
  const discountPercentage = Math.max(
    0,
    Math.min(90, Number(item.discount_percentage ?? 0)),
  );
  const discountedPrice =
    discountPercentage > 0
      ? Number((basePrice * (1 - discountPercentage / 100)).toFixed(2))
      : basePrice;

  return {
    id: String(item.id),
    name: item.name,
    description: item.description,
    price: discountedPrice,
    originalPrice: discountPercentage > 0 ? basePrice : undefined,
    discountPercentage,
    category: item.category ? item.category.name : "Unknown",
    platform: "PC",
    rating: 4.0,
    image: "/BWA_logo.png",
  };
};

export const getApiCategories = async (): Promise<ApiCategory[]> => {
  return fetchJson<ApiCategory[]>("/categories");
};

export const getApiProducts = async (
  searchText?: string,
  categoryText?: string,
): Promise<CatalogProduct[]> => {
  const params = new URLSearchParams();

  if (searchText) {
    params.set("search", searchText);
  }

  if (categoryText) {
    params.set("category", categoryText);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  const products = await fetchJson<ApiProduct[]>(`/products${query}`);

  return products.map(mapApiProductToCatalogProduct);
};

export const getApiProductById = async (
  id: string,
): Promise<CatalogProduct | null> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw await buildApiRequestError(response);
  }

  const product = (await response.json()) as ApiProduct;
  return mapApiProductToCatalogProduct(product);
};

export type ApiAuthUser = {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  is_active?: boolean;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
};

export type ApiOrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number | string;
  created_at?: string;
  updated_at?: string;
  product?: {
    id: number;
    name: string;
    price?: number | string;
    discount_percentage?: number;
  };
};

export type ApiOrder = {
  id: number;
  user_id: number;
  total_amount: number | string;
  status: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    email: string;
  };
  items: ApiOrderItem[];
};

export type ApiComment = {
  id: number;
  product_id: number;
  user_id: number;
  content: string;
  rating: number;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    username?: string;
    name?: string;
    surname?: string;
  };
};

export type CreateOrderPayload = {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
};

type ApiAuthResponse = {
  message: string;
  token: string;
  user: ApiAuthUser;
};

export type RegisterPayload = {
  username: string;
  name: string;
  surname: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AdminUpsertProductPayload = {
  name: string;
  description: string;
  price: number;
  discount_percentage?: number;
  category_id: number;
  is_enabled?: boolean;
};

export type AdminUpdateUserPayload = {
  username: string;
  name: string;
  surname: string;
  email: string;
  role: "user" | "admin";
};

export const registerApiAuth = async (
  payload: RegisterPayload,
): Promise<ApiAuthResponse> => {
  return fetchJson<ApiAuthResponse>("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const loginApiAuth = async (
  payload: LoginPayload,
): Promise<ApiAuthResponse> => {
  return fetchJson<ApiAuthResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const meApiAuth = async (token: string): Promise<ApiAuthUser> => {
  return fetchJson<ApiAuthUser>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const logoutApiAuth = async (
  token: string,
): Promise<{ message: string }> => {
  return fetchJson<{ message: string }>("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getApiUsers = async (token: string): Promise<ApiAuthUser[]> => {
  return fetchJson<ApiAuthUser[]>("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateApiUser = async (
  token: string,
  userId: number,
  payload: AdminUpdateUserPayload,
): Promise<{ message: string; user: ApiAuthUser }> => {
  return fetchJson<{ message: string; user: ApiAuthUser }>(`/users/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const toggleApiUserActive = async (
  token: string,
  userId: number,
): Promise<{ message: string; user: ApiAuthUser }> => {
  return fetchJson<{ message: string; user: ApiAuthUser }>(
    `/users/${userId}/toggle-active`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const deleteApiUser = async (
  token: string,
  userId: number,
): Promise<{ message: string }> => {
  return fetchJson<{ message: string }>(`/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getApiAdminProducts = async (
  token: string,
): Promise<ApiAdminProduct[]> => {
  return fetchJson<ApiAdminProduct[]>("/admin/products", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createApiAdminProduct = async (
  token: string,
  payload: AdminUpsertProductPayload,
): Promise<{ message: string; product: ApiAdminProduct }> => {
  return fetchJson<{ message: string; product: ApiAdminProduct }>(
    "/admin/products",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
};

export const updateApiAdminProduct = async (
  token: string,
  productId: number,
  payload: AdminUpsertProductPayload,
): Promise<{ message: string; product: ApiAdminProduct }> => {
  return fetchJson<{ message: string; product: ApiAdminProduct }>(
    `/admin/products/${productId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
};

export const toggleApiAdminProductEnabled = async (
  token: string,
  productId: number,
): Promise<{ message: string; product: ApiAdminProduct }> => {
  return fetchJson<{ message: string; product: ApiAdminProduct }>(
    `/admin/products/${productId}/toggle-enabled`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const deleteApiAdminProduct = async (
  token: string,
  productId: number,
): Promise<{ message: string }> => {
  return fetchJson<{ message: string }>(`/admin/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getApiMyOrders = async (token: string): Promise<ApiOrder[]> => {
  return fetchJson<ApiOrder[]>("/orders/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getApiAdminOrders = async (token: string): Promise<ApiOrder[]> => {
  return fetchJson<ApiOrder[]>("/orders/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getApiOrderById = async (
  token: string,
  id: number,
): Promise<ApiOrder> => {
  return fetchJson<ApiOrder>(`/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateApiOrderStatus = async (
  token: string,
  orderId: number,
  status: "pending" | "completed" | "cancelled",
): Promise<{ message: string; order: ApiOrder }> => {
  return fetchJson<{ message: string; order: ApiOrder }>(
    `/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );
};

export const createApiOrder = async (
  token: string,
  payload: CreateOrderPayload,
): Promise<{ message: string; order: ApiOrder }> => {
  return fetchJson<{ message: string; order: ApiOrder }>("/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const getApiProductComments = async (
  productId: string,
): Promise<ApiComment[]> => {
  return fetchJson<ApiComment[]>(`/products/${productId}/comments`);
};

export const createApiProductComment = async (
  token: string,
  productId: string,
  payload: { content: string; rating: number },
): Promise<{ message: string; comment: ApiComment }> => {
  return fetchJson<{ message: string; comment: ApiComment }>(
    `/products/${productId}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
};

export const deleteApiComment = async (
  token: string,
  commentId: number,
): Promise<{ message: string }> => {
  return fetchJson<{ message: string }>(`/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
