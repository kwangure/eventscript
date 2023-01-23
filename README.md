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
import {
	ESArray, ESBoolean, ESMap, ESNumber, ESString,
} from 'eventscript/nodes';

const value = new ESString('rainbow');
console.log(`${value} 🌈`);
// rainbow 🌈
```


## EventScript Patterns

<details>
	<summary>🔝 Nested values bubble to parent observers</summary>

```js
const one = new ESNumber(1);
const two = new ESNumber(2);
const three = new ESNumber(3);

const numbers = new ESArray([one, two, three]);
const length = numbers.length;

let numberCount = 0;
numbers.subscribe(() => console.log(`numberCount === ${++numberCount}`));
// numberCount === 1

let lengthCount = 0;
length.subscribe(() => console.log(`lengthCount === ${++lengthCount}`));
// lengthCount === 1

one.set(100);
// numberCount === 2

numbers.push(new ESNumber(4));
// lengthCount === 2
// numberCount === 3

```
</details>

<details>
	<summary>💱 Primitive types are coercible</summary>

This includes `ESString`, `ESNumber` and `ESBoolean`.

```js
const fifteen = 5 + new ESNumber(10);
console.log(`fifteen === 15 (${fifteen === 15})`);
// fifteen === 15 (true)

const catch22 = new ESString('catch') + new ESNumber(22);
console.log(catch22, `(${typeof catch22})`);
// catch22 (string)
```
</details>

<details>
	<summary>🔄 Values are iterable</summary>

Nodes that have iterable native counterparts are also iterable. For example, you can use the `for...of` construct to iterate `ESMap` or `ESString`.
```js
const esString = new ESString('123');

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
const one = new ESNumber(1);
const two = new ESNumber(2);
const three = new ESNumber(3);

const esMap = new ESMap([
	['one', one],
	['two', two],
	['three', three],
]);

console.log(JSON.stringify(esMap));
// {"one":1,"two":2,"three":3}
console.log(esMap.toJSON());
// { one: 1, two: 2, three: 3 }
```
</details>
