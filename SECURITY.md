# Security Policy

BWA Dojo is intentionally vulnerable.

I created this project as a learning and testing environment for web security, penetration testing, vulnerability analysis, and security scanners.

Because of this, many of the security issues you may find are there on purpose.

## Intended Vulnerabilities

Vulnerabilities that are part of the training environment should not normally be reported as security issues.

This includes things such as:

- injection vulnerabilities
- cross-site scripting (XSS)
- broken access control
- authentication weaknesses
- insecure API behaviour
- security misconfigurations

These are part of the project and are meant to be tested and exploited in a controlled environment.

If you find something and you are not sure whether it was intentional, feel free to report it.

## What Should Be Reported

I am mainly interested in issues that are not part of the intended vulnerable scenarios.

For example:

- exposed secrets or credentials
- issues that could affect the host machine
- problems with the Docker or deployment configuration
- security problems in the build or release process
- dependency or supply-chain issues
- vulnerabilities that go beyond the intended scope of the lab

## Reporting an Issue

If you find an unintended security issue, please avoid publishing full technical details publicly before it has been reviewed.

You can report it through GitHub's private vulnerability reporting feature, if available.

Please include as much useful information as possible, such as:

- what the issue is
- how to reproduce it
- which part of the application is affected
- what the possible impact is

## Safe Use

BWA Dojo should only be run in a local or isolated testing environment.

Do not expose it directly to the public Internet and do not use real credentials, personal information, or production data.

The project is intended for education, research, and authorized security testing only.
