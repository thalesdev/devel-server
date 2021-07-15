interface ServiceErrorProps {
  message?: string;
  status?: number;
  code?: string;
  errors?: string[];
}

export class ServiceError extends Error {
  status: number;
  code?: string;
  errors?: string[];

  constructor({ message, status, code, errors }: ServiceErrorProps) {
    super(message || "Internal Server Error");
    this.status = status || 500;
    this.code = code;
    this.errors = errors || [];
  }
}

