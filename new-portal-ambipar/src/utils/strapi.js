export function rtToText(blocks) {
    if (!Array.isArray(blocks)) return "";
    return blocks
        .map((block) =>
        block.children?.map((child) => child.text).join("") ?? ""
        )
        .join("\n");
}
