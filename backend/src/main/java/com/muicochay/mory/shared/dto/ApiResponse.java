package com.muicochay.mory.shared.dto;

import lombok.*;

/**
 * A generic wrapper for API responses, providing a standard structure
 * for success and error messages with optional data payloads.
 *
 * @param <T> the type of the response data
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    /**
     * Creates a successful response with the given data and message.
     *
     * @param data    the data payload
     * @param message a message describing the success
     * @param <T>     the type of the data
     * @return a successful {@code ApiResponse} instance
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data);
    }

    /**
     * Creates a failed response with the given message.
     *
     * @param message a message describing the error
     * @param <T>     the type of the data
     * @return a failed {@code ApiResponse} instance
     */
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }

    /**
     * Creates a failed response with both a message and accompanying data.
     *
     * @param data    the data to include in the response (e.g. validation errors, details)
     * @param message a message describing the error
     * @param <T>     the type of the data
     * @return a failed {@code ApiResponse} instance with provided data
     */
    public static <T> ApiResponse<T> failWithData(T data, String message) {
        return new ApiResponse<>(false, message, data);
    }
}
