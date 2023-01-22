import { type ESNode } from './esnode.d.ts';
import { NODE_VALUE } from './esnode_constants.js';

export class ESString extends ESNode {
	constructor(value: any)

	/** Updates the value of the ESString. */
	set(value: any): void;

	/** Returns the primitive value of the specified object. */
	toJSON(): string;

	/** Iterator */
	[Symbol.iterator](): IterableIterator<string>;

	/** Primitive */
	[Symbol.toPrimitive](): string;


	/*  ------  ESNODE VALUES START  ------  */

	/** Returns the parent of the string. */
	get parentNode(): ESNode<any> | null;

	subscribe(fn: (arg: T) => any): () => boolean;

	/*  ------  ESNODE VALUES END  ------  */


	/*  ------  SIDE-EFFECT-FREE METHODS START  ------  */
	
	/**
	 * Returns a new String consisting of the single UTF-16 code unit located at the specified index.
	 * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
	 */
	at(index: number): string | undefined;

	/**
	 * Returns the character at the specified index.
	 * @param pos The zero-based index of the desired character.
	 */
	charAt(pos: number): string;

	/**
	 * Returns the Unicode value of the character at the specified location.
	 * @param index The zero-based index of the desired character. If there is no character at the specified index, NaN is returned.
	 */
	charCodeAt(index: number): number;

	/**
	 * Returns a nonnegative integer Number less than 1114112 (0x110000) that is the code point
	 * value of the UTF-16 encoded code point starting at the string element at position pos in
	 * the String resulting from converting this object to a String.
	 * If there is no element at that position, the result is undefined.
	 * If a valid UTF-16 surrogate pair does not begin at pos, the result is the code unit at pos.
	 */
	codePointAt(pos: number): number | undefined;

	/**
	 * Returns true if the sequence of elements of searchString converted to a String is the
	 * same as the corresponding elements of this object (converted to a String) starting at
	 * endPosition – length(this). Otherwise returns false.
	 */
	endsWith(searchString: string, endPosition?: number): boolean;

	/**
	 * Returns the position of the first occurrence of a substring.
	 * @param searchString The substring to search for in the string
	 * @param position The index at which to begin searching the String object. If omitted, search starts at the beginning of the string.
	 */
	indexOf(searchString: string, position?: number): number;

	/**
	 * Returns true if searchString appears as a substring of the result of converting this
	 * object to a String, at one or more positions that are
	 * greater than or equal to position; otherwise, returns false.
	 * @param searchString search string
	 * @param position If position is undefined, 0 is assumed, so as to search all of the String.
	 */
	includes(searchString: string, position?: number): boolean;

	/**
	 * Returns the last occurrence of a substring in the string.
	 * @param searchString The substring to search for.
	 * @param position The index at which to begin searching. If omitted, the search begins at the end of the string.
	 */
	lastIndexOf(searchString: string, position?: number): number;

	/**
	 * Determines whether two strings are equivalent in the current locale.
	 * @param that String to compare to target string
	 */
	localeCompare(that: string): number;

	/**
	 * Matches a string with a regular expression, and returns an array containing the results of that search.
	 * @param regexp A variable name or string literal containing the regular expression pattern and flags.
	 */
	match(regexp: string | RegExp): RegExpMatchArray | null;

	/**
	 * Matches a string with a regular expression, and returns an iterable of matches
	 * containing the results of that search.
	 * @param regexp A variable name or string literal containing the regular expression pattern and flags.
	 */
	matchAll(regexp: RegExp): IterableIterator<RegExpMatchArray>;

	/**
	 * Returns true if the sequence of elements of searchString converted to a String is the
	 * same as the corresponding elements of this object (converted to a String) starting at
	 * position. Otherwise returns false.
	 */
	startsWith(searchString: string, position?: number): boolean;

	/** Returns the primitive value of the specified object. */
	valueOf(): string;

	/*  ------  SIDE-EFFECT-FREE METHODS END  ------  */

}
