# Spec design

These rules apply to specs under this directory.

- Create `describe` groups only for method calls, using `#method_name` for instance methods and `.method_name` for class methods.
- Define an explicit `subject` in every `describe` group. The subject should represent the method call being tested.
- Put all setup necessary to prepare a scenario inside its `context`, including scenario-specific `let` declarations, stubs, and `before` hooks.
- Keep contexts shallow: do not nest `context` groups.
- Give each context its own complete scenario preparation. Do not switch or override values across contexts to derive another scenario; prefer repeating the preparation.
- Put all expectations that can reuse the same subject invocation in the same `it` example.
- For one-line specs, such as Shoulda Matchers specs, use a separate `it` example for each expectation.
- In multi-line `it` examples, invoke the subject in a separate statement before the expectations. Capture its return value when needed, then assert against that value. Do not trigger the subject through the first expectation in a sequence.
- Invoke the subject only once per `it` example. Reuse the captured result or inspect the effects of that invocation for subsequent expectations. One-line matcher specs may use their usual implicit subject syntax.
- In request specs, exercise the behavior under test through HTTP requests and verify user-facing outcomes through HTTP responses. Scenario setup may use models, forms, services, factories, or stubs directly; do not inspect models to assert the result of a request (for example, `Short.last` or `Short.count`).
