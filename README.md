## Summary
This project implements tests that exercise some features of the LastPass password generator. The three tests are 
defined in an `it` block in the file `lastpasstests/e2e/LastPassTests.cy.js`.

The first test exercises the password generation button using the default parameters.

The second test exercises the password length feature. It iterates through a set of test cases and validates the 
length of the generated password. The test cases are located in `lasspasstests/fixtures/PasswordLengthTestcases.json`

The third test exercises the four checkboxes that determine the set of characters the password can contain. All possible
permutations of checkboxes are validated. The generated passwords are checked against regex patterns to verify that they 
contain the correct set of characters only. The regex patterns are defined in 
`lastpasstests/fixtures/CheckboxRegexPatterns.json`

## How to run
1. Extract homework.zip
2. Open a CLI
3. Navigate to the lastpasstests directory
4. Install Cypress by running `npm install cypress`
5. run `cypress run LastPassTests.cy.js --headed --no-exit --browser chrome`

This starts up Cypress and runs the tests in a headed instance of Chrome so that the user can see the test runner.

The test results are shown in the test runner window, and in the CLI after running the command.

## Notes
The Cypress executable is located in `lasspasstests/node_modules/cypress/bin`. If the executable cannot be found from
the root `lasspasstests` directory, the fully-qualified file path may need to be specified.