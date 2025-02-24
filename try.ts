import { List } from "./src/list/index.ts";

const myList = new List(1, 2, 3, 4, 5);

myList.nth(3)?.swapWithPrevious();

myList.enqueue(6, 7);
myList.push(8, 9);

myList.modify(node => node.value * 2);

myList.find(node => node.value < 10, 1)?.replace(100);

myList.extract(node => node.value < 10, -1);

console.log(myList.values);
