export async function completer(input, abortSinal) {
    const r = await fetch(`http://localhost:8821/?input=${input}`, { signal: abortSinal });
    return await r.json();
}