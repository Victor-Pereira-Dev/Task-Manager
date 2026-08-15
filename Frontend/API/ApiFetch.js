export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(endpoint, {
            ...options,
            headers,
        });
    } catch (erro) {
        console.error("Erro de rede ao chamar a API:", erro);
        throw erro;
    }

    const novoToken = response.headers.get("X-New-Token");
    if (novoToken) {
        localStorage.setItem("token", novoToken);
    }

    if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login/login.html";
        return null;
    }

    return response;
}