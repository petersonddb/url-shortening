## Workflow specific validations

- For workflow-specific validations use a form object. A workflow-specific validation is a validation basically necessary only for a specific end point call.
- Do not expose the object wrapped by a form object. Form object initializer should have required named parameters to be filled explicitly by the controller. Model validation errors should be aggregated to the form object errors; do not use `:base`. Views should use the form object, not the model.
