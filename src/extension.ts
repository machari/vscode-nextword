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
						//.getText(new vscode.Range(new vscode.Position(Math.max(0, position.line - 4), 0), position))
						.getText(new vscode.Range(new vscode.Position(Math.max(0, position.line), 0), position))
						.replace(/\s/g, " ")
						.slice(-prov.inputTrimLen);
					
					var output = "";
					try {
						output = child_process.execSync("nextword -g -n " + prov.candidateNum, { input: input }).toString();
					} catch (e) {
						console.log("nextword error:", e);
						vscode.window.showErrorMessage("nextword error:" + String(e));
						prov.available = false;
						return new vscode.CompletionList([], false);
					}

					if (output === "\n") {
						return new vscode.CompletionList([], false);
					}
					
					let order = 10000;
					const res = new vscode.CompletionList;
					for(let word of output.trim().split("\n").slice(0, prov.candidateNum)) {
						let parts = word.split("\t")
						// console.log(parts, parts.length) ;
						
						let match_type = parts[0]
						let label = parts[1]
						let document = ""
						let detail = match_type						

						let kind = vscode.CompletionItemKind.Text
						if(parts.length > 2) {
							kind = vscode.CompletionItemKind.Event
							document = parts[2]
						}

						if(match_type == "N5" ){
							kind = vscode.CompletionItemKind.Method
						} else if(match_type == "N4" ){
							kind = vscode.CompletionItemKind.Interface
						} else if(match_type == "N3" ){
							kind = vscode.CompletionItemKind.Keyword
						} else if(match_type == "N2" ){
							kind = vscode.CompletionItemKind.TypeParameter
						} 
						
						const item = new vscode.CompletionItem(label, kind);
						item.insertText = parts[1]
						item.sortText = order++ + parts[1]
						
						if( document.length > 0) {							
							document = document
								.replace(/\[Language:[^\]]*\]\/\//g, '') // [Language: Old English; Origin: putian]
								.replace(/\[Date:[^\]]*\]\/\//g, '') // 
								.replace(/----------[^\-]+----------\/\//g, '')								
								.replace(/\/\/|\\n/g, '\n') // // or \n
								.replace(/  --/g, '\n * ') // 
							// console.log(document)

							let detail = document.match(/\[[^h][^\]]*\]/g) || []; // [T]
							let detail_unique = detail.filter(function(elem, index, self) {
								return index === self.indexOf(elem);
							})
							// console.log(detail, detail_unique)
							item.detail = detail_unique.join(' ')
							
							var regex = new RegExp(label, 'g');
							document = document.replace(regex, '**' + label + '**')
							item.documentation = new vscode.MarkdownString(document);							
						} else {
							item.detail = detail;
						}						
						
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
