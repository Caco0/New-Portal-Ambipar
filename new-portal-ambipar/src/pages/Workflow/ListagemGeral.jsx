import { Link, useParams } from "react-router-dom";
import data from "../../data/workflowData.json" // api strapi

export default function ListagemGeral() {
    const { categoria } = useParams();
    const itens = data[cartegoria] || [];

    return (
        <section className="max-w-6xl mx-auto mt-24 px-6">
            <h2 className="text-3xl font-bold mb-8 text-center capitalize text-[#B2CC21] dark:text-[#CDFF00]">
                {categoria}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {itens.map((itens) => (
                    <Link
                    key={item.id}
                    to={`/workflow/${categoria}/${item.id}`}
                    className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-green-400/60 transition-all"
                    >
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{item.description}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}