import {ApiError} from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    if(!(error instanceof ApiError)){
        error = new ApiError(
            500,
            "Internal Server Error"
        );
    }
    const response = {
        success : false,
        message : error.message,
        errors : error.errrors || [],
        data: error.data || null
    };

    if(process.env.NODE_ENV === "development"){
        response.stack = error.stack;
    }

    return res
           .status(error.statusCode)
           .json(response);
};

export {errorHandler};