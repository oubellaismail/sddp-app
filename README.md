# sddp-app

Sample application source code — the workload used to demonstrate the Secure-by-Default Delivery Platform end to end.

CI/CD (scan, build, sign) is defined here per `pfa/pipeline-design-spec.md`. Deployment manifests live separately in `sddp-app-config` (ADR-005 — app/config repo split), so code-change authority and deploy-change authority stay independently controllable.

Design docs: see the `pfa` repo.
