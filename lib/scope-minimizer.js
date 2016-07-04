(function(root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define('scopeMinimizer', ['exports', 'esprima', 'estraverse', 'esrefactor'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports, require('esprima'), require('estraverse'), require('esrefactor'));
    } else {
        factory((root.scopeMinimizer = {}), esprima, estraverse, esrefactor);
    }
}(this, function(exports, esprima, estraverse, esrefactor) {
    'use strict';

    var _references;

    function getEssentialIntervals(astNode) {
        var intervals = [];
        estraverse.traverse(astNode, {
            enter: function(node) {
                if (hasReferenceInside(node.range[0], node.range[1])) {
                    intervals.push({
                        start: node.loc.start.line,
                        end: node.loc.end.line
                    });
                    //start and end are next to each other or equal
                    if (node.loc.start.line >= node.loc.end.line - 1) {
                        this.skip();
                    }
                } else {
                    this.skip();
                }
            }
        });
        return intervals;
    }

    //Should be unnecessary once i figure out a cleaner way
    //  to traverse while having a specific variable reference
    //  in mind at each step
    function hasReferenceInside(start, end) {
        for (var i = 0; i < _references.length; i++) {
            //speedup the loop
            // if (_references[i]>end){
            //   return false;
            // }
            if ((_references[i] >= start) &&
                (_references[i] <= end)) {
                return true;
            }
        }
        return false;
    }

    function getFoldsFromIntervals(essentialIntervals, totalLines) {
        if (totalLines <= 1) {
            return [];
        }
        //array is always sorted up and no to folds
        //  intersect each other
        var folds = [{
            start: 1,
            end: totalLines
        }];
        for (var i = 0; i < essentialIntervals.length; i++) {
            cutSingleFold(folds, essentialIntervals[i].start);
            cutSingleFold(folds, essentialIntervals[i].end);
        }

        return folds;
    }

    function cutSingleFold(folds, cuttingLine) {
        for (var i = 0; i < folds.length; i++) {
            if ((folds[i].start < cuttingLine) &&
                (folds[i].end > cuttingLine)) {
                //replace with two
                var oldStart = folds[i].start,
                    oldEnd = folds[i].end;
                folds.splice(i,1,
                  {
                    start: oldStart,
                    end: cuttingLine - 1
                  },
                  {
                      start: cuttingLine + 1,
                      end: oldEnd
                  });
                break;
            }
            if ((folds[i].start === cuttingLine) &&
                (folds[i].end === cuttingLine)) {
                //just delete
                folds.splice(i,1);
                break;
            }
            if ((folds[i].start < cuttingLine) &&
                (folds[i].end === cuttingLine)) {
                //replace
                folds[i] = {
                    start: folds[i].start,
                    end: cuttingLine - 1
                };
                break;
            }
            if ((folds[i].start === cuttingLine) &&
                (folds[i].end > cuttingLine)) {
                //replace
                folds[i] = {
                    start: cuttingLine + 1,
                    end: folds[i].end
                };
                break;
            }
        }
    }

    //returns an array of necessary folds for a variable
    //   located at position 'cursorPosition' in code fragment 'code'
    function getFolds(code, cursorPosition) {
        _references = [];
        //build ast
        try {
            var codeAST = esprima.parse(code, {
                loc: true,
                range: true
            });
        } catch (err) {
            console.log(err);
            return undefined;
        }
        //find references to a variable
        var esrefactorContex = new esrefactor.Context(code);
        var identifiedVar = esrefactorContex.identify(cursorPosition);
        //not a variable under cursorPosition
        if (identifiedVar === undefined) {
            console.log('not a variable under cursorPosition')
            return undefined;
        }
        //aspires to be sorted one day
        var references = identifiedVar.references;
        if (identifiedVar.declaration !== null) {
            references.push(identifiedVar.declaration);
        }
        _references = references.map(function(x){return x.range[0]});
        //get essential intervals
        var essential = getEssentialIntervals(codeAST);
        //cycle through essential lines creating folds
        return getFoldsFromIntervals(essential, codeAST.loc.end.line);
    }

    exports.getFolds = getFolds;

}));
