import { API_pay_amount, API_today_earnings, API_filter_date_wise_and_phone, API_filter_date_wise, API_search_customer, ApiUrl, api, login, my_account } from "../constant/apipath";
import axios from "axios";
import { getUserId } from "./localStorage";

export const loginUser = async (datas) => {
    try {
        const requestBody = {
            username: datas.name,
            password: datas.password
        };
        const { data } = await axios.post(ApiUrl + api + login, requestBody);
        return data;
    } catch (error) {
        return error;
        // console.error("Error fetching data", error);
    }
}

export const myAccount = async (datas) => {
    try {
        const requestBody = {
            user_id:datas?datas: JSON.parse(await getUserId()),
        };
        const { data } = await axios.post(ApiUrl + api + my_account, requestBody);
        return data.data;
    } catch (error) {
        return error;
        // console.error("Error fetching data", error);
    }
}

export const todayEarnings = async () => {

    console.log("JSON.parse(await getUserId())",JSON.parse(await getUserId()));
    
    try {
        const requestBody = {
            agent_id: JSON.parse(await getUserId()),
        };
        const { data } = await axios.post(ApiUrl + api + API_today_earnings, requestBody);
        return data.data;
    } catch (error) {
        return error;
        // console.error("Error fetching data", error);
    }
}

export const history = async (datas) => {
    try {
        const requestBody = {
            agent_id: JSON.parse(await getUserId()),
            from_date: datas.from,
            to_date: datas.to
        };
        const { data } = await axios.post(ApiUrl + api + API_filter_date_wise, requestBody);
        if (data.data) {
            return data.data.individual_earnings;
        } else {
            return data;
        }
    } catch (error) {
        return error;
        // console.error("Error fetching data", error);
    }
}

export const searchCustomer = async (id) => {
    try {
        const requestBody = {
            customer_id: id,
        };
        const { data } = await axios.post(ApiUrl + api + API_search_customer, requestBody);
        return data;
    } catch (error) {
        return error;
        // console.error("Error fetching data", error);
    }
}

export const dateWiseHistory = async (datas) => {
    try {
        const requestBody = {
            agent_id: JSON.parse(await getUserId()),
            from_date: datas.from,
            to_date: datas.to,
            phone: datas.number
        };
        const { data } = await axios.post(ApiUrl + api + API_filter_date_wise_and_phone, requestBody);
        if (data.data) {
            return data.data;

        } else {
            return data;
        }
    } catch (error) {
        return error;
        // console.error("Error fetching data", error);
    }
}


export const payment = async (datas, amount) => {
    try {
        const requestBody = {
            agent_id: JSON.parse(await getUserId()),
            customer_id: datas.chit_custid,
            amount: amount,
            chit_id: datas.chit_id,
            id: datas.id
        };
        const { data } = await axios.post(ApiUrl + api + API_pay_amount, requestBody);
        return data;
    } catch (error) {
        return error;
        // console.error("Error fetching data", error);
    }
}