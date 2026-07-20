# Inhire API Reference

Inhire uses a centralized REST API backed by subdomains/tenants.

## Base URLs
*   **Production API**: `https://api.inhire.app`
*   **Authentication API**: `https://auth.inhire.app`

## Public Endpoints

Every public endpoint requires the `X-Tenant` header identifying the tenant/company subdomain.

### 1. Resolve Subdomain
Resolves a subdomain to tenant metadata (including the official tenant ID, which typically matches the subdomain).
*   **HTTP Method**: `GET`
*   **Endpoint**: `https://api.inhire.app/tenants/public/resolve/{subdomain}`
*   **Headers**:
    *   `User-Agent` (Browser UA recommended)
*   **Response**: JSON containing `"tenant"` configuration, open graph images, logo, etc.

### 2. List Public Job Posts
Lists all public, published jobs for a company.
*   **HTTP Method**: `GET`
*   **Endpoint**: `https://api.inhire.app/job-posts/public/pages`
*   **Headers**:
    *   `X-Tenant`: `{subdomain}`
*   **Response**: JSON object containing `"jobsPage"` (an array of job listings).

### 3. Get Public Job Post Details
Retrieves detailed information (description, contract type, workplace type) for a specific job post.
*   **HTTP Method**: `GET`
*   **Endpoint**: `https://api.inhire.app/job-posts/public/pages/{jobId}`
*   **Headers**:
    *   `X-Tenant`: `{subdomain}`
*   **Response**: JSON containing the full job details.
