import { Link, useParams } from "react-router-dom";
import data from "../../data/workflowData.json";

export default function DetalheGeral() {

    const { categoria, id} = useParams();
    const itens = data[categoria] || [];
    const item = itens.find((i) => i.id === parseInt(id));

    const index = itens.findIdex((i) => i.id === parseInt(id));
    const prev = itens[index - 1];
    const next = itens[index + 1];

    if (!item) return <p className="text-center mt-20">Item não encontrado</p>

    return(
        <section className="max-w-3x1 mx-auto mt-24 px-6 text-center">
            <h2 className="text-3xl font-bold mb-4 text-[#B2CC21] dark:text-[#CDFF00]">{item.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{item.description}</p>
            <img src={item.image} alt={item.title} className="w-full rounded-xl shadow-lg mb-6" />
            <a 
            href={item.pdf} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#B2CC21] dark:bg-[#CDFF00] text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition">
                📃 Abrir PDF
            </a>
            <div className="flex justify-between mt-10">
                {prev ? (
                    <Link to={`/workflow/${categoria}/${prev.id}`} className="hover:underline text-[#B2CC21] dark:text-[#CDFF00]">
                        ← {prev.title}
                    </Link>
                    ) : <span></span>}

                    {next ? (
                    <Link to={`/workflow/${categoria}/${next.id}`} className="hover:underline text-[#B2CC21] dark:text-[#CDFF00]">
                        {next.title} →
                    </Link>
                    ) : <span></span>}
            </div>
        </section>
    )
}