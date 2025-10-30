import { useLayoutEffect } from "react";

export default function ForceTopOnMount() {
    useLayoutEffect(() => {
        // impede restauração automática da posição
        if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
        }

        // força topo antes da primeira pintura
        window.scrollTo(0, 0);
    }, []);

    return null;
}

