import { Route } from "react-router-dom";
export default function VeiculosLogin() {
    return (
        <section 
        className="min-h-[calc(100vh-80px)]
            bg-white text-gray-900 flex items-center justify-center
            dark:bg-[#0b1220] dark:text-gray-100">
                <div 
                className="mx-auto flex h-full w-full  items-center justify-center px-6">
                    <img src={`${import.meta.env.BASE_URL}carro-ambipar.jpg`} alt="veículo"  className="opacity-20 rounded-lg"/>
                    <div className="mx-auto flex px-6 items-center justify-center absolute ">
                        <div className="w-96 h-96 space-y-10 rounded-l-lg bg-[#CDFF00] dark:bg-gray-900 p-8 shadow-lg">
                        <h3 className="text-lg font-semibold text-black dark:text-white">Agendamento Login</h3>
                        <img 
                        src={`${import.meta.env.BASE_URL}ambipar-logo-light.png`} 
                        alt="Ambipar Logo" 
                        className=" mx-auto items-center transition-all dark:hidden" />
                        <img 
                        src={`${import.meta.env.BASE_URL}ambipar-logo-dark.png`} 
                        alt="Ambipar Logo Dark" 
                        className=" mx-auto items-center transition-all hidden dark:block" />
                        </div>
                        {/* Placeholder para o formulário de login */}
                        <div className="w-96 h-96  space-y-6 rounded-r-lg bg-gray-900 dark:bg-[#CDFF00] p-8 shadow-lg">
                            <h3 
                            className="text-lg text-center font-semibold text-white dark:text-black">
                                Bem-vindo! Faça login para acessar o sistema de agendamento.
                            </h3>
                            {/* Formulário de login */}
                            <form action="Login" className="space-y-4">
                                <input 
                                id="email"
                                type="email" 
                                placeholder="E-mail" 
                                className="bg-gray-900 border-[#CDFF00] rounded-lg p-1 w-full m-2 p-1 m-auto"/>
                                <input 
                                id="password"
                                type="password" 
                                placeholder="Digite sua senha" 
                                className="bg-gray-900 border-[#CDFF00] rounded-lg p-1 w-full m-2 p-1 m-auto focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                <button 
                                    type="button"
                                    onclick="togglePassword()"
                                    class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                                >
                                    👁
                                </button>
                            </form>
                            {/* BOTTOM 50vh */}
                            <div className="w-full mx-auto">
                                <div className="p-2 bg-[#CDFF00] dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition-all">
                                <a href="#">
                                    <p className="text-center text-lg font-bold text-black dark:text-white">Login</p>
                                </a>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
        </section>
    );
}