# Contributing to BWA Dojo

Thanks for your interest in contributing to BWA Dojo.

I created BWA Dojo as a deliberately vulnerable web application for learning, penetration testing, vulnerability analysis, and security scanner testing.

Contributions that help improve the project are welcome.

## Ways to Contribute

Some examples of useful contributions are:

- fixing bugs that are not part of the intended vulnerable behaviour
- improving the documentation
- improving the Docker or local setup
- improving the user interface
- adding new vulnerable scenarios
- improving existing vulnerable scenarios
- adding testing or training material
- improving compatibility or project maintenance

## Intentional Vulnerabilities

Please keep in mind that many insecure behaviours in BWA Dojo are intentional.

Before fixing something that appears to be a security vulnerability, check whether it is part of the training environment.

If you are unsure, open an issue first and describe what you found.

This helps avoid accidentally removing functionality that exists specifically for security testing.

## Adding a New Vulnerability

If you want to add a new vulnerable scenario, try to keep it realistic and connected to the normal application flow.

A contribution should make it clear:

- what the vulnerability is
- where it is implemented
- how it can be reproduced
- what the learning objective is

The vulnerable behaviour should remain limited to the BWA Dojo environment and should not introduce unnecessary risks to the host system.

## Pull Requests

Before opening a pull request:

1. Make sure the application still runs correctly.
2. Test the part of the application you changed.
3. Keep changes focused on one feature or issue where possible.
4. Explain clearly what you changed and why.

For larger changes, especially new vulnerable scenarios or changes to the application architecture, opening an issue first is recommended.

## Security Issues

If you find a security issue that is not part of the intended vulnerable environment, please follow the instructions in [SECURITY.md](SECURITY.md).

## License

By contributing to BWA Dojo, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
