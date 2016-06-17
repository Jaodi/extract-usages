'use babel';

import ExtractUsagesView from './extract-usages-view';
import { CompositeDisposable } from 'atom';
import scopeMinimizer from './scope-minimizer';

export default {

  extractUsagesView: null,
  folds: undefined,
  subscriptions: null,

  activate(state) {
    this.extractUsagesView = new ExtractUsagesView(state.extractUsagesViewState);
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'extract-usages:foldUnrelated': () => this.foldUnrelated()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.extractUsagesView.destroy();
  },

  serialize() {
    return {
      extractUsagesViewState: this.extractUsagesView.serialize()
    };
  },

  foldUnrelated(){
    if (typeof (this.folds) === 'undefined'){
      var activeEditor = atom.workspace.getActiveTextEditor()
      var text = activeEditor.getText();
      var point = activeEditor.getCursorBufferPosition()
      var buffer = activeEditor.getBuffer();
      var position = buffer.characterIndexForPosition(point);
      this.folds = scopeMinimizer.getFolds(text,position);
	  if (typeof (this.folds) !== 'undefined'){
		for (var i = 0; i<this.folds.length; i++){
		  this.folds[i].foldObject =
			activeEditor.createFold(this.folds[i].start-2,this.folds[i].end-1);
		}
	  }
    }
    else {
      for (var i = 0; i<this.folds.length; i++){
        this.folds[i].foldObject.destroy();
      }
      this.folds = undefined;
    }
  }

};
