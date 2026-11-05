import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setStrapiToken } from "../../services/strapi";

export default function VeiculosLogin() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/local", {
                identifier: identifier.trim(),
                password,
            });

            const { jwt, user } = response.data;

            if (!jwt || !user) {
                throw new Error("Resposta de autenticação inválida.");
            }

            // Mantém a sessão durante a navegação nesta aba.
            sessionStorage.setItem("veiculos_jwt", jwt);
            sessionStorage.setItem(
                "veiculos_usuario",
                JSON.stringify({
                    id: user.id,
                    username: user.username,
                })
            );

            // Configura o JWT para as próximas requisições.
            setStrapiToken(jwt);

            // Abre a página principal da frota.
            navigate("/veiculos", { replace: true });
        } catch (err) {
            const status = err.response?.status;

            if (status === 400 || status === 401) {
                setError("Usuário ou senha inválidos.");
            } else {
                setError(
                    "Não foi possível realizar o login. Verifique a conexão com o servidor."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="min-h-[calc(100vh-80px)] bg-white text-gray-900 flex items-center justify-center dark:bg-[#0b1220] dark:text-gray-100">
            <div className="relative mx-auto flex min-h-[600px] w-full items-center justify-center px-4 py-10">
                <img
                    src={`${import.meta.env.BASE_URL}carro-ambipar.jpg`}
                    alt=""
                    className="absolute inset-0 h-full w-full object-contain opacity-20 pointer-events-none"
                />

                <div className="relative z-10 flex w-full max-w-3xl flex-col md:flex-row shadow-xl rounded-xl overflow-hidden">
                    {/* Painel de identidade Ambipar */}
                    <div className="flex min-h-64 flex-1 flex-col justify-between gap-8 bg-[#CDFF00] p-8 dark:bg-gray-900">
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                            Agendamento Login
                        </h3>

                        <div>
                            <img
                                src={`${import.meta.env.BASE_URL}ambipar-logo-light.png`}
                                alt="Ambipar Logo"
                                className="mx-auto max-h-32 w-full object-contain dark:hidden"
                            />

                            <img
                                src={`${import.meta.env.BASE_URL}ambipar-logo-dark.png`}
                                alt="Ambipar Logo"
                                className="mx-auto hidden max-h-32 w-full object-contain dark:block"
                            />
                        </div>
                    </div>

                    {/* Formulário de autenticação */}
                    <div className="flex flex-1 flex-col justify-center gap-6 bg-gray-900 p-8 dark:bg-[#CDFF00]">
                        <h3 className="text-center text-lg font-semibold text-white dark:text-black">
                            Bem-vindo! Faça login para acessar o sistema de agendamento.
                        </h3>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="identifier"
                                    className="mb-1 block text-sm text-white dark:text-black"
                                >
                                    Usuário ou e-mail
                                </label>

                                <input
                                    id="identifier"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={identifier}
                                    onChange={(event) =>
                                        setIdentifier(event.target.value)
                                    }
                                    placeholder="Usuário ou e-mail"
                                    className="w-full rounded-lg border border-[#CDFF00] bg-gray-900 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1 block text-sm text-white dark:text-black"
                                >
                                    Senha
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Digite sua senha"
                                        className="w-full rounded-lg border border-[#CDFF00] bg-gray-900 p-2 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Ocultar senha"
                                                : "Mostrar senha"
                                        }
                                        className="absolute inset-y-0 right-0 px-3 text-gray-300"
                                    >
                                        {showPassword ? "🙈" : "👁"}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p
                                    role="alert"
                                    className="rounded-lg bg-red-100 p-3 text-sm text-red-800"
                                >
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-[#CDFF00] p-3 text-lg font-bold text-black shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-800 dark:text-white"
                            >
                                {loading ? "Entrando..." : "Login"}
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-300 dark:text-gray-700">
                            Acesso exclusivo para usuários cadastrados.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}