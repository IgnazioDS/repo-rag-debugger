from __future__ import annotations

import unittest

from repo_rag_debugger.cli import run


class CliTests(unittest.TestCase):
    def test_summary(self) -> None:
        output = run(["summary"])
        self.assertIn("Repo RAG Debugger", output)
        self.assertIn("Developers waste time reconstructing code context from scattered docs, logs, and repository structure.", output)

    def test_capabilities(self) -> None:
        output = run(["capabilities"])
        self.assertIn("Core capabilities:", output)
        self.assertIn("Index repositories and markdown docs", output)

    def test_roadmap(self) -> None:
        output = run(["roadmap"])
        self.assertIn("# Roadmap", output)
        self.assertIn("## Phase 1", output)


if __name__ == "__main__":
    unittest.main()
