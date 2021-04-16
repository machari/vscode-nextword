import * as vscode from 'vscode';
import * as child_process from 'child_process';

class Nextword {
	available: boolean; // on error, available will be false.
	candidateNum: number;
	inputTrimLen: number;

	constructor() {
		this.available = true;
		this.inputTrimLen = 1000;
		this.candidateNum = 10;
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
						output = child_process.execSync("nextword", { input: input }).toString();
					} catch (e) {
						console.log("nextword error:", e);
						vscode.window.showErrorMessage("nextword error:" + String(e));
						prov.available = false;
						return new vscode.CompletionList([], false);
					}

					if (output === "\n") {
						return new vscode.CompletionList([], false);
					}

					console.log(output) ;

					// const res = output
					// 	.trim()
					// 	.split(" ")
					// 	.slice(0, prov.candidateNum)
					// 	.map(word => new vscode.CompletionItem(word, vscode.CompletionItemKind.Text));
					
					const res = new vscode.CompletionList;
					for(let word of output.trim().split(" ").slice(0, prov.candidateNum)) {
						const item = new vscode.CompletionItem(word, vscode.CompletionItemKind.Method);
						// item.detail = "Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.";
						item.documentation = new vscode.MarkdownString("indefinite article, determiner  also an\n\n1 used to show that you are talking about someone or something that has not been mentioned before, or that your listener does not know about:  --We have a problem.//  --There was a hole in the fence.//  --Suddenly they heard a loud bang.//    the1 //\n2 used to show that you are referring to a general type of person or thing and not a specific person or thing:  --Would you like a sandwich?//  --I want to train to be an engineer.//  --He's a really nice man.//  --Take a look at this.//  --It needs a good clean.//\n3 used before someone's family name to show that they belong to that family:  --One of his daughters had married a Rothschild.//\n4 one:  --a thousand pounds//  --a dozen eggs//  --You'll have to wait an hour or two.//\n5 used in some phrases that say how much of something there is:  --There were a lot of people at the party.//  -- A few weeks from now I'll be in Venice.//  --You have caused a great deal of trouble.//\n6 used to mean 'each' when stating prices, rates, or speeds:  --I get paid once a month.//  --The eggs cost $2 a dozen.//\n7 used before singular nouns to mean all things of a particular type:  --A square has four sides (=all squares have four sides) .//  --A child needs love and affection.//\n8 used once before two nouns that are mentioned together very often:  --I'll fetch you a cup and saucer.//  --Does everyone have a knife and fork?//\n9 used before the -ing forms of verbs when they are used as nouns referring to an action, event, or sound:  --There was a beating of wings overhead.//  --Bernice became aware of a humming that seemed to come from all around her.//\n10 used before nouns that are usually uncountable when other information about the quality, feeling etc is added by an adjective, phrase, or clause:  --Candidates must have a good knowledge of chemistry.//\n11 used before the name of a substance, food etc to refer to a particular type of it:  --Use a good cheese to make the sauce.//  --plants that grow well in a rich moist soil//\n12 used before the name of a drink to refer to a cup or glass of that drink:  --Can I get you a coffee?//  --Renwick went to the bar and ordered a beer.//\n13 used before the name of a famous artist to refer to a painting by that artist:  --an early Rembrandt//\n14 used before a name to mean someone or something that has the same qualities as that person or thing:  --She was hailed as a new Marilyn Monroe.//\n15 used before someone's name when you do not know who they are:  --There is a Mr Tom Wilkins on the phone.//\n16 used before the names of days, months, seasons, and events in the year to refer to a particular one:  --We arrived in England on a cold wet Sunday in 1963.//  --I can't remember a Christmas like it.//  ----------//  WORD CHOICE: a, an  //  Before a word beginning with a vowel sound, use  an : an elephant |  an umbrella |  an obvious mistake //  !!  Use  an before an 'h' that is not pronounced : an hour later | an honest explanation //  !!  Use  a before a 'u' that is pronounced like 'you' : a university  |  a unique opportunity //  !!  Use  an before an abbreviation that is pronounced with a vowel sound at the start : an SOS call | an MP3 file //  ----------//\nA 1  a/e[hA366]/ n   plural  A's  a's //\n1 [U and C] the first letter of the English alphabet:\n2 [U and C] the sixth note in the musical scale of C major or the musical key based on this note:\n3 [C] the highest mark that a student can get in an examination or for a piece of work:  --I got an A in French.//  --Julia got straight As  (=all A's) in high school.//\n4  an A student:   AmE someone who regularly gets the best marks possible for their work in school or college//\n5 [U] used to refer in a short way to one of two different things or people. You can call the second one B:  --A demands [hA124]500, B offers [hA124]100.//    plan A at plan1 (5)//\n6  from A to B:  from one place to another//  get/go from A to B //  --Hiring a car was the best way to get from A to B.//\n7  from A to Z:  describing, including, or knowing everything about a subject//  --the history of 20th century art from A to Z//\n8  A34, A40 etc:  the name of a road in Britain that is smaller than a motorway, but larger than a B-road//    A-road//\n9 [U] a common type of blood:    A level//\nA 2   the written abbreviation of amp or amps//" );
						
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
