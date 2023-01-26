# EventScript

Data nodes in EventScript have DOM-like event bubbling. For example,
just like events fire on an input and bubble to its form, changes to a number
in array triggers observers of the number and the array.

## Getting started
### Installation
```
npm install eventscript
```
### Usage
```js
import { es } from 'eventscript';

const value = es.string('rainbow');

console.log(`${value} 🌈`);
// rainbow 🌈
```


## EventScript Patterns

<details>
	<summary>🔝 Nested values bubble to parent observers</summary>

```js
const numbers = es.array([
	es.number(1),
	es.number(2),
	es.number(3),
]);
const one = numbers.at(0);
const length = numbers.length;

let numberCount = 0;
numbers.subscribe(() => console.log(`numberCount === ${++numberCount}`));
// numberCount === 1

let lengthCount = 0;
length.subscribe(() => console.log(`lengthCount === ${++lengthCount}`));
// lengthCount === 1

one.set(100);
// numberCount === 2

numbers.push(es.number(4));
// lengthCount === 2
// numberCount === 3

```
</details>

<details>
	<summary>💱 Primitive types are coercible</summary>

This includes `ESString`, `ESNumber` and `ESBoolean`.

```js
const fifteen = 5 + es.number(10);
console.log(`fifteen === 15 (${fifteen === 15})`);
// fifteen === 15 (true)

const catch22 = es.string('catch') + es.number(22);
console.log(catch22, `(${typeof catch22})`);
// catch22 (string)
```
</details>

<details>
	<summary>🔄 Values are iterable</summary>

Nodes that have iterable native counterparts are also iterable. For example, you can use the `for...of` construct to iterate `ESMap` or `ESString`.
```js
const esString = es.string('123');

for (const char of esString) {
	console.log(`${char} Mississippi`);
}
// 1 Mississipi
// 2 Mississipi
// 3 Mississipi

const set = new Set(esString);
console.log(set);
// Set(3) { '1', '2', '3'}
```
</details>

<details>
	<summary>💾 Values are serializable</summary>

```js
const esMap = es.map({
	one: es.number(1),
	two: es.number(2),
	three: es.number(3),
});

console.log(JSON.stringify(esMap));
// {"one":1,"two":2,"three":3}
console.log(esMap.toJSON());
// { one: 1, two: 2, three: 3 }
```
</details>
