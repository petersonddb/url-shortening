export default function api(counter: number): number {
    return counter + 1;
}

const count = api(10);
console.log(count);
