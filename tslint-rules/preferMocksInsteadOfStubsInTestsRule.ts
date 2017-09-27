import * as Lint from 'tslint';
import { getNextToken } from 'tsutils';
import { ClassDeclaration, SourceFile, SyntaxKind } from 'typescript';
import { RuleHelpers } from './ruleHelpers';

class PreferMocksInsteadOfStubsInTestsWalker extends Lint.RuleWalker {

  public visitSourceFile(sourceFile: SourceFile) {
    if (sourceFile.fileName.search('.spec.ts') > 0) {
      // console.log('####' + sourceFile.fileName);
      // if (!sourceFile.fileName.endsWith('registration-page.component.spec.ts')) {
      //     return;
      // }
      super.visitSourceFile(sourceFile);
    }
  }

  public visitClassDeclaration(node: ClassDeclaration) {
    const classToken = RuleHelpers.getNextChildTokenOfKind(node, SyntaxKind.ClassKeyword);
    const classNameToken = getNextToken(classToken);
    const className = classNameToken.getText();
    this.addFailureAtNode(classNameToken, 'Do not use stub classes like "' + className +
      '" in tests. Use ts-mockito or reusable testhelper classes instead.');

    super.visitClassDeclaration(node);
  }
}

/**
 * Implementation of the prefer-mocks-instead-of-stubs-in-tests rule.
 */
export class Rule extends Lint.Rules.AbstractRule {

  public apply(sourceFile: SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new PreferMocksInsteadOfStubsInTestsWalker(sourceFile, this.getOptions()));
  }
}
