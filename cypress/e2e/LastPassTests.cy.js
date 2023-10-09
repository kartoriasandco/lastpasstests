import pageModel from '../fixtures/LastPassPage.json'
import permutations from '../fixtures/CheckboxRegexPatterns.json'
import passwordLengthTestCases from '../fixtures/PasswordLengthTestCases.json'
import env from './../fixtures/TestEnvironment.json'

describe('LastPass tests', () => {
	let selectors = pageModel.selectors
	
	// Navigate to LastPass web page
	beforeEach(() => {
		cy.visit(env.testEnvironment.url)
		cy.get(selectors.buttonUsePasswordGenerator).click()
	})
	
	it('test generate button', () => {
		// Wait until password text field is populated
		getCurrentPassword().should('not.equal', '')

		// A new password should be generated when the button is pressed
		getCurrentPassword().then(oldPassword => {
			cy.get(selectors.buttonGeneratePassword).click()
			getCurrentPassword().should('not.equal', oldPassword)
		})
	})
	
	it('test password length', () => {
		// Test positive cases
		passwordLengthTestCases.positiveCases.forEach(testCase => {
			setPasswordLengthValue(testCase.value)
			getCurrentPassword().should('have.length', testCase.expectedResult.toString())
			getPasswordLengthValue().should('equal', testCase.expectedResult)
		})
		
		// Test negative cases
		passwordLengthTestCases.negativeCases.forEach(testCase => {
			setPasswordLengthValue(testCase.value)
			getCurrentPassword().should('have.length', testCase.expectedResult)
			getPasswordLengthValue().should('equal', testCase.expectedResult)
		})
		
		// Test empty string
		cy.get(selectors.textFieldPasswordLength).clear({ scrollBehavior: 'center' })
		cy.get(selectors.buttonGeneratePassword).click({ scrollBehavior: 'center' })
		getCurrentPassword().should('have.length', "1")
		getPasswordLengthValue().should('equal', "1")
		
		cy.pause()
	})
	
	/*
	 * Verifies that the generated password follows the format options specified by the four checkboxes. It checks
	 * every permutation of the checkboxes.
	 */
	it('test password format check boxes', () => {
		let regexPatterns = permutations.regexPatterns
		
		// Verify that all check boxes are initially checked
		verifyCheckboxState('Uppercase', selectors.checkboxUppercase, true);
		verifyCheckboxState('Lowercase', selectors.checkboxLowercase, true)
		verifyCheckboxState('Numbers', selectors.checkboxNumbers, true)
		verifyCheckboxState('Symbols', selectors.checkboxSymbols, true)
		
		// All characters
		getCurrentPassword().should('match', new RegExp(regexPatterns.all))
		
		// Lowercase, numbers, and symbols
		clickCheckbox(selectors.checkboxUppercase)
		getCurrentPassword().should('match', new RegExp(regexPatterns.noUppercase))
		
		// Lowercase and numbers
		clickCheckbox(selectors.checkboxSymbols)
		getCurrentPassword().should('match', new RegExp(regexPatterns.lowercaseAndNumbers))
		
		// Lowercase only
		clickCheckbox(selectors.checkboxNumbers)
		getCurrentPassword().should('match', new RegExp(regexPatterns.lowercaseOnly))
		
		// Lowercase and symbols
		clickCheckbox(selectors.checkboxSymbols)
		getCurrentPassword().should('match', new RegExp(regexPatterns.lowercaseAndSymbols))
		
		// Symbols only
		clickCheckbox(selectors.checkboxLowercase)
		getCurrentPassword().should('match', new RegExp(regexPatterns.symbolsOnly))
		
		// Uppercase and symbols
		clickCheckbox(selectors.checkboxUppercase)
		getCurrentPassword().should('match', new RegExp(regexPatterns.uppercaseAndSymbols))
		
		// Uppercase, lowercase, and symbols
		clickCheckbox(selectors.checkboxLowercase)
		getCurrentPassword().should('match', new RegExp(regexPatterns.noNumbers))
		
		// Uppercase and lowercase
		clickCheckbox(selectors.checkboxSymbols)
		getCurrentPassword().should('match', new RegExp(regexPatterns.uppercaseAndLowercase))
		
		// Uppercase, lowercase, and numbers
		clickCheckbox(selectors.checkboxNumbers)
		getCurrentPassword().should('match', new RegExp(regexPatterns.noSymbols))
		
		// Uppercase and numbers
		clickCheckbox(selectors.checkboxLowercase)
		getCurrentPassword().should('match', new RegExp(regexPatterns.uppercaseAndNumbers))
		
		// Uppercase, numbers, and symbols
		clickCheckbox(selectors.checkboxSymbols)
		getCurrentPassword().should('match', new RegExp(regexPatterns.noLowercase))
		
		// Numbers and symbols
		clickCheckbox(selectors.checkboxUppercase)
		getCurrentPassword().should('match', new RegExp(regexPatterns.numbersAndSymbols))
		
		// Numbers only
		clickCheckbox(selectors.checkboxSymbols)
		getCurrentPassword().should('match', new RegExp(regexPatterns.numbersOnly))
		
		// Uppercase only
		clickCheckbox(selectors.checkboxUppercase)
		clickCheckbox(selectors.checkboxNumbers)
		getCurrentPassword().should('match', new RegExp(regexPatterns.uppercaseOnly))
	})
	
	/*
	 * Retrieves the current value of the password text field.
	 */
	function getCurrentPassword() {
		return cy.log('Getting current password value')
			.get(selectors.textFieldPasswordValue)
			.invoke('val')
	}
	
	/*
	 * Retrieves the current value of the Password Length text field.
	 */
	function getPasswordLengthValue() {
		return cy.log('Getting current length value')
			.get(selectors.textFieldPasswordLength)
			.invoke('val')
	}
	
	/*
	 * Types the specified value into the Password Length text field.
	 */
	function setPasswordLengthValue(length) {
		cy.log('Setting password length to: ', length)
			.get(selectors.textFieldPasswordLength)
			.clear( { scrollBehavior: "center" })
			.type(length, { scrollBehavior: 'center' })
		cy.get(selectors.buttonGeneratePassword).click()
	}
	
	/*
	 * Clicks the checkbox identified by the specified selector. This is a method so that the checkbox can be checked
	 * in tests without the need to set the scrollBehavior option each time. Without setting scrollBehavior to "center",
	 * the checkbox is hidden under a banner and cannot be interacted with.
	 */
	function clickCheckbox(checkboxSelector) {
		cy.get(checkboxSelector).click({ scrollBehavior: "center" })
	}
	
	/*
	 * Verifies that the specified checkbox`s state matches the boolean parameter. This is a hacky method whose
	 * implementation is necessitated by the way the checkboxes are implemented. The checkbox is a <label> instead of
	 * the customary <input>. That <label> has a click event associated with it. The only state difference between
	 * checked and  unchecked is a change of the background-colour CSS property of a CSS pseudo-element.
	 *
	 * A given checkbox is checked if and only if its ::before CSS pseudo-element has a background-color value of
	 * rgb(221, 34, 34). It is unchecked if and only if its ::before CSS pseudo-element has a background-color value of
	 * rgb(255, 255, 255).
	 */
	function verifyCheckboxState(name, checkboxSelector, isChecked) {
		return cy.get(checkboxSelector).within(() => {
			cy.window().then(win => {
				cy.contains(name).then($el => {
					// Access the ::before CSS pseudo-element
					const before = win.getComputedStyle($el[0], '::before')
					
					// Get the property value and verify it is correct
					let backgroundColour = isChecked ? "rgb(221, 34, 34)" : "rgb(255, 255, 255)"
					expect(before.getPropertyValue('background-color')).to.equal(backgroundColour)
				})
			})
		})
	}
})