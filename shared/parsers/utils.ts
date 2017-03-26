export function getStringBetween(line: string, prefix: string, suffix: string): string {
    if (line.indexOf(prefix) === -1 || line.indexOf(suffix) === -1) {
        return '';
    }
    return line.slice(line.indexOf(prefix) + prefix.length, line.indexOf(suffix));
}
