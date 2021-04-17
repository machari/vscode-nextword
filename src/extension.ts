import * as vscode from 'vscode';
import * as child_process from 'child_process';

class Nextword {
	available: boolean; // on error, available will be false.
	candidateNum: number;
	inputTrimLen: number;

	constructor() {
		this.available = true;
		this.inputTrimLen = 1000;
		this.candidateNum = 30;
	}
		
	// provider provides completion items.
	provider(): vscode.Disposable {
		let prov = this;
		return vscode.languages.registerCompletionItemProvider(
			'*',
			{
				provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
					if (!prov.available) {
						return new vscode.CompletionList([], false);
					}

					let input = document
						.getText(new vscode.Range(new vscode.Position(Math.max(0, position.line - 4), 0), position))
						.replace(/\s/g, " ")
						.slice(-prov.inputTrimLen);
					
					var output = "";
					try {
						output = child_process.execSync("nextword -n 30", { input: input }).toString();
					} catch (e) {
						console.log("nextword error:", e);
						vscode.window.showErrorMessage("nextword error:" + String(e));
						prov.available = false;
						return new vscode.CompletionList([], false);
					}

					if (output === "\n") {
						return new vscode.CompletionList([], false);
					}

					// console.log(output) ;

					// const res = output
					// 	.trim()
					// 	.split(" ")
					// 	.slice(0, prov.candidateNum)
					// 	.map(word => new vscode.CompletionItem(word, vscode.CompletionItemKind.Text));
					
					let order = 10000;
					const res = new vscode.CompletionList;
					for(let word of output.trim().split("\n").slice(0, prov.candidateNum)) {
						let parts = word.split("\t")
						// console.log(parts, parts.length) ;
						
						let label = word
						let document = ""
						let kind = vscode.CompletionItemKind.Text
						if(parts.length > 1) {
							kind = vscode.CompletionItemKind.Keyword
							label = parts[0]
							document = parts[1]					
						}
						
						const item = new vscode.CompletionItem(label, kind);
						item.sortText = order++ + label
						// item.detail = "Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.";
						if( document.length > 0) {							
							document = document
								.replace(/\[Language:.*\]\/\//g, '')
								.replace(/\[Date:.*\]\/\//g, '')
								.replace(/----------[^\-.]+----------\/\//g, '')								
								.replace(/\/\/|\\n/g, '\n')
								.replace(/ --/g, '\n * ')																
							// console.log(document)

							let detail = document.match(/\[[^h.]+\]/g) || [];
							let detail_unique = detail.filter(function(elem, index, self) {
								return index === self.indexOf(elem);
							})
							// console.log(detail, detail_unique)
							item.detail = detail_unique.join(' ')
							
							var regex = new RegExp(label, 'g');
							document = document.replace(regex, '**' + label + '**')
							item.documentation = new vscode.MarkdownString(document);
							// item.documentation = document;							
						}
						
						// console.log(item.label) ;
						res.items.push(item) ;
					}
					return res;
				}
			},
			"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
			"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
			" ",
		);
	}

}

export function activate(context: vscode.ExtensionContext) {
	let nextword = new Nextword();
	context.subscriptions.push(nextword.provider());
}
