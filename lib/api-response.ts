import { NextResponse } from 'next/server';

/**
 * A class to standardize API responses.
 */
export class ApiResponse {
    /**
     * Creates a success response.
     * @param data The payload to send.
     * @returns A NextResponse object.
     */
    static success<T>(data: T) {
        return NextResponse.json(data);
    }

    /**
     * Creates a Not Found response.
     * @param message The error message.
     * @returns A NextResponse object.
     */
    static notFound(message: string = 'Resource not found') {
        return NextResponse.json({ message }, { status: 404 });
    }

    /**
     * Creates a Bad Request response.
     * @param errors The validation errors.
     * @returns A NextResponse object.
     */
    static badRequest(errors: any) {
        return NextResponse.json({ message: 'Bad Request', errors }, { status: 400 });
    }

    /**
     * Creates a No Content response.
     * @returns A NextResponse object.
     */
    static noContent() {
        return new NextResponse(null, { status: 204 });
    }
}

/**
 * Handles unexpected errors in API routes.
 * @param error The error object, which is of type unknown.
 * @param defaultMessage A default message to use if the error is not an instance of Error.
 * @returns A NextResponse object.
 */
export function handleApiError(error: unknown, defaultMessage: string = 'An unexpected error occurred.'): NextResponse {
    console.error(error); // It's good practice to log the actual error

    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: defaultMessage }, { status: 500 });
}
