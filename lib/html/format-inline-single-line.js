"use strict";

const postcssStringify = require("postcss/lib/stringify");

function rawValue(node, prop) {
	const value = node[prop];
	const raw = node.raws[prop];
	if (raw && raw.value === value) {
		return raw.raw;
	}
	return value;
}

function stringifyDeclNode(node) {
	// Single-line inline: always one space after ':' between prop and value.
	let string = `${node.prop}: ${rawValue(node, "value")}`;
	if (node.important) {
		string += node.raws.important || " !important";
	}
	return string;
}

function stringifyCommentNode(node) {
	let left = node.raws.left;
	if (typeof left === "undefined") {
		left = node.raws.commentLeft;
	}
	if (typeof left === "undefined") {
		left = " ";
	}
	let right = node.raws.right;
	if (typeof right === "undefined") {
		right = node.raws.commentRight;
	}
	if (typeof right === "undefined") {
		right = " ";
	}
	return `/*${left}${node.text}${right}*/`;
}

function formatInlineSingleLineRoot(root) {
	const chunks = [];
	root.each(function (node) {
		if (node.type === "decl") {
			chunks.push(stringifyDeclNode(node));
		} else if (node.type === "comment") {
			chunks.push(stringifyCommentNode(node));
		} else {
			const parts = [];
			postcssStringify(node, function (chunk) {
				parts.push(chunk);
			});
			chunks.push(parts.join(""));
		}
	});
	return chunks.join("; ");
}

function shouldFormatInlineSingleLine(root) {
	if (!root.source || !root.source.inline) {
		return false;
	}
	if (root.source.lang === "custom-template") {
		return false;
	}
	if (root.raws.inlineMultiline) {
		return false;
	}
	return true;
}

module.exports = {
	formatInlineSingleLineRoot,
	shouldFormatInlineSingleLine,
};
