"""Regressões dos workflows do GitHub Actions deste repositório."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

GITHUB = Path(__file__).resolve().parents[1] / ".github"
WORKFLOWS = GITHUB / "workflows"


def _read(name: str) -> str:
    return (WORKFLOWS / name).read_text(encoding="utf-8")


def test_comment_workflow_can_read_the_artifacts_of_the_run() -> None:
    """Baixar um artefato de outra execução exige `actions: read`; sem ele o
    download falha com "Resource not accessible by integration" e o comentário
    nunca chega ao PR."""
    comment = _read("pr-checks-comment.yml")

    assert "actions: read" in comment
    assert "continue-on-error" not in comment


def test_workflows_only_reference_workflow_files_that_exist() -> None:
    """Comentários e documentos que citam um workflow pelo nome apontam para um
    arquivo que existe (um nome velho engana quem investiga uma falha)."""
    sources = [*WORKFLOWS.glob("*.yml"), *GITHUB.glob("*.md")]
    existing = {path.name for path in [*WORKFLOWS.glob("*.yml"), *GITHUB.glob("*.yml")]}
    existing.add("action.yml")

    missing = {
        f"{source.name}: {name}"
        for source in sources
        for name in re.findall(
            r"(?<![\w./-])([\w-]+\.yml)\b", source.read_text("utf-8")
        )
        if name not in existing
    }

    assert missing == set()


def test_release_workflow_expands_file_lists_through_arrays() -> None:
    """`$VERSION_FILES` e `$bump_flag` viram vários argumentos: sem aspas ficam
    sujeitos a globbing e a divisão de palavras; com array, cada um é um item."""
    release = _read("release-please.yml")

    unquoted = re.findall(r'(?<!")\$(?:VERSION_FILES|bump_flag)\b', release)

    assert unquoted == []
    assert '"${release_files[@]}"' in release


def test_release_workflow_reads_the_epoch_of_annotated_tags_as_a_single_number() -> (
    None
):
    """O `tag-release` cria tags anotadas. `git show -s --format=%ct <tag>`
    imprime antes o cabeçalho da tag, e esse texto chega ao `jq --argjson` como
    JSON inválido. Ler o commit apontado (`^{commit}`) devolve só o número."""
    release = _read("release-please.yml")

    assert 'git show -s --format=%ct "$latest_tag"' not in release
    assert 'git log -1 --format=%ct "${latest_tag}^{commit}"' in release


def test_epoch_command_of_the_release_workflow_works_with_annotated_tags(
    tmp_path: Path,
) -> None:
    def git(*args: str) -> str:
        return subprocess.run(
            ["git", "-c", "user.name=t", "-c", "user.email=t@t", *args],
            cwd=tmp_path,
            check=True,
            capture_output=True,
            text=True,
        ).stdout

    git("init", "-q")
    git("commit", "-q", "--allow-empty", "-m", "chore: base")
    git("tag", "-a", "v0.1.0", "-m", "Release 0.1.0")

    broken = git("show", "-s", "--format=%ct", "v0.1.0").strip()
    fixed = git("log", "-1", "--format=%ct", "v0.1.0^{commit}").strip()

    assert not broken.isdigit()
    assert fixed.isdigit()


def test_setup_uv_passes_inputs_to_the_script_through_env() -> None:
    """Uma expressão `${{ inputs.* }}` dentro do script vira texto do shell
    antes de ele rodar; passar pelo ambiente mantém o valor como dado."""
    action = (GITHUB / "actions" / "setup-uv" / "action.yml").read_text("utf-8")
    script = action.split("      run: |\n", 1)[1]

    assert "${{" not in script
    assert "ALL_EXTRAS" in script


def test_commitlint_runs_a_pinned_version() -> None:
    """O título do PR é validado por uma ferramenta de terceiros; instalar a
    "última versão" a cada execução deixa o gate à mercê de uma publicação."""
    checks = _read("pr-checks.yml")

    assert re.search(r"@commitlint/cli@\d+\.\d+\.\d+", checks)
    assert re.search(r"@commitlint/config-conventional@\d+\.\d+\.\d+", checks)


def test_pull_request_messages_are_not_indented_into_code_blocks() -> None:
    """Linhas com 4 ou mais espaços viram bloco de código no Markdown do
    GitHub; as mensagens postadas no PR são montadas sem recuo."""
    for name in ("pr-checks.yml", "pr-checks-comment.yml"):
        workflow = _read(name)

        assert "const message = [" in workflow, name
        assert "const message = `" not in workflow, name


def test_setup_uv_is_pinned_to_an_exact_release() -> None:
    """O setup-uv não publica tag de major flutuante (`v10` não existe); a
    referência precisa ser uma versão exata."""
    for path in [*WORKFLOWS.glob("*.yml"), *GITHUB.glob("actions/*/action.yml")]:
        text = path.read_text("utf-8")
        for ref in re.findall(r"astral-sh/setup-uv@(\S+)", text):
            assert re.fullmatch(r"v\d+\.\d+\.\d+", ref), (path.name, ref)
