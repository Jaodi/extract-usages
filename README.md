# Extract usages package

This tool finds all usages of a variable in the file and leaves only lines related to it in the editor window. "Extract usages" essentially makes your code look like it was written for a single variable.

![Extract usages](https://raw.githubusercontent.com/Jaodi/extract-usages/master/img/Animation.gif)

### Installation

There are three dependencies for scopeMinimizer: esprima, estraverse and esrefactor. It should be enough to install only esrefactor for it is dependent on other two.

```sh
$ npm i esrefactor
```

### Why it exists

The incentive for this program was my reading of "Code Complete" by Steve McConnell arguing minimization of a variable's scope not only logically, but visually as well (making the lines, containing a reference to said variable closer to each other). The concept is very native to me, for that is how I start exploring someone else's code: focus on a variable that took my attention by having a descriptive name or throwing an error or some through some other means, and finding every line, where it is mentioned.
Editors I've seen always do this in a separate window via "Find Usages" feature, which I find somewhat confusing. The dream was to fold all lines non-related to the variable being examined (that is to say, leave only lines, containing a reference to the variable, or the declaration of an enclosing block of one of the former) and unfold the rest when necessary.
