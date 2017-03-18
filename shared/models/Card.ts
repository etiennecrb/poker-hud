export default class Card {
    public value: string;
    public color: string;

    constructor(s: string) {
        this.value = s[0];
        this.color = s[1];
    }
}
