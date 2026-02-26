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
                    <div className="mx-auto flex px-6 items-center justify-center absolute">
                        <div className="w-96 h-96 space-y-6 rounded-l-lg bg-[#CDFF00] dark:bg-gray-900 p-8 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-400 dark:text-gray-400">Agendamento Login</h3>
                        <img 
                        src={`${import.meta.env.BASE_URL}ambipar-logo-light.png`} 
                        alt="Ambipar Logo" 
                        className=" mx-auto items-center transition-all dark:hidden" />
                        <img 
                        src={`${import.meta.env.BASE_URL}ambipar-logo-dark.png`} 
                        alt="Ambipar Logo Dark" 
                        className=" mx-auto items-center transition-all hidden dark:block" />
                        </div>
                        <div className="w-96 h-96  space-y-6 rounded-r-lg bg-white/90 p-8 shadow-lg">
                        teste b
                        </div>
                    </div>
                </div>
        </section>
    );
}