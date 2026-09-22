import api from "./axios";

export const createTransaction = async (transactionData) => {
    const response = await api.post(
        "/transactions",
        transactionData
    );

    return response.data;
};

export const getTransactions = async (
    page = 1,
    limit = 10
) => {
    const response = await api.get(
        `/transactions?page=${page}&limit=${limit}`
    );

    return response.data;
};