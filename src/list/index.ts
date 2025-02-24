export class List<T> {
    #nodes: ListNode<T>[] = [];

    get nodes(): ListNode<T>[] {
        return this.#nodes;
    }

    private set nodes(nodes: ListNode<T>[]) {
        this.#nodes = nodes;
    }

    get values(): T[] {
        return this.nodes.map(node => node.value);
    }

    get length(): number {
        return this.nodes.length;
    }

    get first(): ListNode<T> | undefined {
        return this.at(0);
    }

    get last(): ListNode<T> | undefined {
        return this.at(-1);
    }

    get initial(): List<T> {
        return this.slice(0, -1);
    }

    get tail(): List<T> {
        return this.slice(1);
    }

    get lastIndex(): number {
        return this.length - 1;
    }

    get isEmpty(): boolean {
        return !this.isNotEmpty;
    }

    get isNotEmpty(): boolean {
        return this.length > 0;
    }

    get lengthIsEven(): boolean {
        return this.length % 2 === 0;
    }

    get lengthIsOdd(): boolean {
        return this.length % 2 === 1;
    }

    constructor(...values: T[]) {
        this.push(...[values].flat(1));
    }

    node(value: T): ListNode<T>;
    node(...values: T[]): ListNode<T>[];
    node(...values: T[]): ListNode<T> | ListNode<T>[] {
        return ListNode.from(this, ...[values].flat(1));
    }

    at(index: number): ListNode<T> | undefined {
        return this.nodes.at(index);
    }

    nth(index: number): ListNode<T> | undefined {
        return this.at(index - 1);
    }

    push(...values: T[]): this {
        return this.nodes.push(...this.node(...[values].flat(1))), this;
    }

    pop(): ListNode<T> | undefined {
        return this.nodes.pop();
    }

    enqueue(...values: T[]): this {
        return this.nodes.unshift(...this.node(...[values].flat(1))), this;
    }

    dequeue(): ListNode<T> | undefined {
        return this.nodes.shift();
    }

    clone(): List<T> {
        return (clone => (clone.nodes.forEach(node => (node.list = clone)), clone))(structuredClone(this));
    }

    slice(start?: number, end?: number): List<T> {
        return new List(...this.values.slice(start, end));
    }

    splice(index: number, deleteCount: number, ...values: T[]): List<T> {
        return new List(
            ...this.nodes.splice(index, deleteCount, ...this.node(...[values].flat(1))).map(node => node.value)
        );
    }

    spliceThen(index: number, deleteCount: number, ...values: T[]): this {
        return this.splice(index, deleteCount, ...[values].flat(1)), this;
    }

    drop(index: number): this {
        return this.spliceThen(index, 1);
    }

    toReversed(): List<T> {
        return new List(...this.clone().values.toReversed());
    }

    reverse(): this {
        return this.nodes.reverse(), this;
    }

    toUnique(): List<T> {
        return new List(...new Set(this.clone().values));
    }

    unique(): this {
        return (this.nodes = this.node(...new Set(this.values))), this;
    }

    toSorted(compareFn?: (a: ListNode<T>, b: ListNode<T>) => number): List<T> {
        return new List(
            ...this.clone()
                .nodes.toSorted(compareFn)
                .map(node => node.value)
        );
    }

    sort(compareFn?: (a: ListNode<T>, b: ListNode<T>) => number): this {
        return (this.nodes = this.node(...this.nodes.toSorted(compareFn).map(node => node.value))), this;
    }

    map<U>(callbackfn: (node: ListNode<T>) => U): List<U> {
        return new List(...this.clone().nodes.map(callbackfn));
    }

    modify(callbackfn: (node: ListNode<T>) => T): this {
        return (this.nodes = this.node(...this.nodes.map(callbackfn))), this;
    }

    forEach(callbackfn: (node: ListNode<T>) => void): void {
        return this.nodes.forEach(callbackfn);
    }

    toFiltered<S extends T>(predicate: (node: ListNode<T>) => node is ListNode<S>): List<S>;
    toFiltered(predicate: (node: ListNode<T>) => unknown): List<T>;
    toFiltered(predicate: (node: ListNode<T>) => unknown): List<T> {
        return new List(
            ...this.clone()
                .nodes.filter(predicate)
                .map(node => node.value)
        );
    }

    filter(predicate: (node: ListNode<T>) => unknown): this {
        return (this.nodes = this.node(...this.nodes.filter(predicate).map(node => node.value))), this;
    }

    some(predicate: (node: ListNode<T>) => unknown, required = 1): boolean {
        if (required <= 0) return true;
        if (required > this.length) return false;
        for (const node of this.nodes) if (predicate(node) && --required <= 0) return true;
        return false;
    }

    every(predicate: (node: ListNode<T>) => unknown, permit = 0): boolean {
        if (permit > this.length) return true;
        for (const node of this.nodes) if (!predicate(node) && permit-- <= 0) return false;
        return true;
    }

    find<S extends T>(predicate: (node: ListNode<T>) => node is ListNode<S>, skip?: number): ListNode<S> | undefined;
    find(predicate: (node: ListNode<T>) => unknown, skip?: number): ListNode<T> | undefined;
    find(predicate: (node: ListNode<T>) => unknown, skip = 0): ListNode<T> | undefined {
        const matches: ListNode<T>[] = [];
        for (const node of this.nodes)
            if (predicate(node))
                if (matches.length === skip) return node;
                else matches.push(node);
        return matches.at(skip);
    }

    extract(index: number): ListNode<T> | undefined;
    extract<S extends T>(predicate: (node: ListNode<T>) => node is ListNode<S>, skip?: number): ListNode<T> | undefined;
    extract(predicate: (node: ListNode<T>) => unknown, skip?: number): ListNode<T> | undefined;
    extract(arg0: number | ((node: ListNode<T>) => unknown), skip = 0): ListNode<T> | undefined {
        return typeof arg0 === "number" ? this.splice(arg0, 1).at(0) : this.find(arg0, skip)?.extractSelf();
    }

    extractThen(index: number): this;
    extractThen<S extends T>(predicate: (node: ListNode<T>) => node is ListNode<S>, skip?: number): this;
    extractThen(predicate: (node: ListNode<T>) => unknown, skip?: number): this;
    extractThen(arg0: number | ((node: ListNode<T>) => unknown), skip?: number): this {
        return typeof arg0 === "number" ? this.extract(arg0) : this.extract(arg0, skip), this;
    }

    fromUntil(start: (node: ListNode<T>) => unknown, end?: (node: ListNode<T>) => unknown): List<T> {
        const startIndex = this.find(start)?.index;
        const endIndex = end && this.slice(startIndex).find(end)?.index;
        return this.slice(startIndex, endIndex && endIndex + 1);
    }

    fromUntilNext(predicate: (node: ListNode<T>) => unknown): List<T> {
        return this.fromUntil(predicate, predicate);
    }
}

export class ListNode<T> {
    readonly uid = Symbol();

    get index(): number {
        return this.list.nodes.map(node => node.uid).indexOf(this.uid);
    }

    get next(): ListNode<T> {
        return this.atOffset(1) ?? this.list.first!;
    }

    get previous(): ListNode<T> {
        return this.atOffset(-1) ?? this.list.last!;
    }

    get isFirst(): boolean {
        return this.index === 0;
    }

    get isNotFirst(): boolean {
        return !this.isFirst;
    }

    get isLast(): boolean {
        return this.index === this.list.lastIndex;
    }

    get isNotLast(): boolean {
        return !this.isLast;
    }

    get antiIndex(): number {
        return this.list.lastIndex - this.index;
    }

    get indexIsEven(): boolean {
        return this.index % 2 === 0;
    }

    get indexIsOdd(): boolean {
        return this.index % 2 === 1;
    }

    get inFirstHalf(): boolean {
        return this.index < this.list.length / 2;
    }

    get inSecondHalf(): boolean {
        return this.index >= this.list.length / 2;
    }

    get isMiddleNode(): boolean {
        return this.index === this.list.length / 2;
    }

    constructor(public list: List<T>, readonly value: T) {}

    static from<T>(list: List<T>, value: T): ListNode<T>;
    static from<T>(list: List<T>, ...values: T[]): ListNode<T>[];
    static from<T>(list: List<T>, ...values: T[]): ListNode<T> | ListNode<T>[] {
        return [values].flat(1).map(value => new ListNode(list, value));
    }

    atOffset(offset: number): ListNode<T> | undefined {
        return this.list.at(this.index + offset);
    }

    insertAtOffset(offset: number, ...values: T[]): this {
        return this.list.splice(this.index + offset + 1, 0, ...[values].flat(1)), this;
    }

    insertAfter(...values: T[]): this {
        return this.insertAtOffset(1, ...[values].flat(1));
    }

    insertBefore(...values: T[]): this {
        return this.insertAtOffset(-1, ...[values].flat(1));
    }

    extractOffset(offset: number): ListNode<T> | undefined {
        return this.list.extract(this.index + offset);
    }

    extractSelf(): ListNode<T> | undefined {
        return this.list.extract(this.index);
    }

    extractNext(): ListNode<T> | undefined {
        return this.list.extract(this.index + 1);
    }

    extractNextThen(): this {
        return this.extractNext(), this;
    }

    extractPrevious(): ListNode<T> | undefined {
        return this.list.extract(this.index - 1);
    }

    extractPreviousThen(): this {
        return this.extractPrevious(), this;
    }

    replace(...values: T[]): void {
        this.list.splice(this.index, 1, ...[values].flat(1));
    }

    swapWithNodeAtOffset(offset: number): this {
        const node = this.atOffset(offset);
        if (!node) return this;
        const nodeIndex = node.index;
        const thisIndex = this.index;
        return this.list.splice(nodeIndex, 1, this.value), this.list.splice(thisIndex, 1, node.value), this;
    }

    swapWithNext(): this {
        return this.swapWithNodeAtOffset(1);
    }

    swapWithPrevious(): this {
        return this.swapWithNodeAtOffset(-1);
    }
}
