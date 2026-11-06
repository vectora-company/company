"""
Company — SConstruct (SCons build file)

Uso (PowerShell / cmd, a partir da raiz do repositório):
    scons               → exibe ajuda
    scons build         → build de produção do app (`vite build` + Nitro)
    scons prod          → deploy de produção na Vercel (projeto `vectora-company`)
    scons tests         → vitest
    scons coverage      → vitest com relatório de cobertura
    scons lint          → prettier --check + oxlint + typecheck (paraglide + tsr + tsc)
    scons format        → prettier --write + oxlint --fix
    scons update        → atualiza deps: pnpm (app) + uv (tooling de utils/),
                          respeitando ranges/lockfiles
    scons update --latest → mesma coisa, mas ignora ranges/lockfiles (pnpm
                          --latest cruza majors) — usar só antes de uma migração
                          grande, seguido de revisão manual de cada breaking change
    scons clean         → remove outputs de build e cobertura

Pré-requisitos: uv e pnpm no PATH. `scons prod` exige a CLI da Vercel autenticada
e o diretório linkado ao projeto certo (`vercel link`). O deploy automático da
`master` roda por `.github/workflows/company.yml`; este alvo é o equivalente
local, para quando o deploy precisa sair da máquina.
Instalar SCons: pip install scons (ou uv tool install scons)
"""

import os
import re
import shutil
import subprocess
import sys

AddOption(
    "--latest",
    dest="latest",
    action="store_true",
    default=False,
    help="scons update --latest: ignora ranges/lockfiles, força major mais novo",
)

# ── Helpers ───────────────────────────────────────────────────────────────────

ROOT = Dir(".").abspath

_ANSI_RE = re.compile(r"\x1b(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")


def _find_pnpm() -> str:
    if sys.platform == "win32":
        for name in ("pnpm.cmd", "pnpm.exe", "pnpm"):
            found = shutil.which(name)
            if found:
                return found
    return shutil.which("pnpm") or "pnpm"


PNPM = _find_pnpm()


def _run(
    cmd: list[str],
    env: dict | None = None,
    cwd: str | None = None,
    log=None,
    discard_stderr: bool = False,
) -> None:
    """Executa um comando, falha se o código de retorno for ≠ 0.

    Com ``log`` (file handle), espelha stdout+stderr para o terminal E para o
    arquivo (tee). O pipe desliga cores ANSI, deixando o .txt limpo.

    ``discard_stderr=True`` roteia stderr para DEVNULL — útil para ferramentas
    que emitem avisos ruidosos em stderr mas reportam erros reais via código de
    retorno (ex: bandit com comentários em língua não-inglesa).

    stdin sempre vai para DEVNULL: sem isso, o subprocesso herda o stdin do
    scons e qualquer prompt interativo não coberto pelas flags de automação
    (--yes/--frozen-lockfile/etc — ex.: já observado no `wrangler d1
    migrations apply` e no `vercel --prod` do deploy de produção) trava pra
    sempre esperando uma resposta que nunca chega, em silêncio (a própria
    saída do prompt fica bufferizada e nunca aparece no log). Com stdin
    fechado, qualquer prompt recebe EOF na hora e o comando falha rápido e
    visível em vez de travar por horas.
    """
    merged = {**os.environ, **(env or {})}
    run_cwd = cwd or ROOT
    header = f"\n>> [{os.path.relpath(run_cwd, ROOT)}] {' '.join(str(c) for c in cmd)}"
    print(header)
    stderr_dest = subprocess.DEVNULL if discard_stderr else None
    if log is None:
        result = subprocess.run(
            cmd, cwd=run_cwd, env=merged, stderr=stderr_dest, stdin=subprocess.DEVNULL
        )
        rc = result.returncode
    else:
        merged["PYTHONIOENCODING"] = "utf-8"
        log.write(header + "\n")
        log.flush()
        proc = subprocess.Popen(
            cmd,
            cwd=run_cwd,
            env=merged,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL if discard_stderr else subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
        )
        for line in proc.stdout:  # type: ignore[union-attr]
            sys.stdout.write(line)
            log.write(_ANSI_RE.sub("", line))
        proc.wait()
        rc = proc.returncode
    if rc != 0:
        raise SystemExit(rc)


#: `_run` fecha o stdin, então o pnpm não pode perguntar antes de recriar um
#: node_modules incompatível (troca de store/versão do pnpm). Sem
#: `confirmModulesPurge=false` ele aborta com
#: ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY em vez de reinstalar.
PNPM_INSTALL = ["install", "--frozen-lockfile", "--config.confirmModulesPurge=false"]


def _open_log(name: str):
    logdir = os.path.join(ROOT, ".scons-logs")
    os.makedirs(logdir, exist_ok=True)
    return open(os.path.join(logdir, f"{name}.txt"), "w", encoding="utf-8")


# ── Build ─────────────────────────────────────────────────────────────────────


def _pnpm_install_if_needed(log) -> None:
    """Instala deps do app se node_modules ausente ou desatualizado."""
    modules = os.path.join(ROOT, "node_modules")
    lock = os.path.join(ROOT, "pnpm-lock.yaml")
    stamp = os.path.join(modules, ".pnpm-install-stamp")
    if (
        not os.path.isdir(modules)
        or not os.path.isfile(stamp)
        or (os.path.isfile(lock) and os.path.getmtime(lock) > os.path.getmtime(stamp))
    ):
        _run([PNPM, *PNPM_INSTALL], log=log)
        open(stamp, "w").close()  # noqa: PTH123 WPS515


def _action_build(target, source, env):
    with _open_log("build") as log:
        _pnpm_install_if_needed(log)
        _run([PNPM, "run", "build"], log=log)
    print("\n>> log completo (limpo) em .scons-logs/build.txt")
    print(">> saída do build: .output/")


# ── Lint ──────────────────────────────────────────────────────────────────────


def _action_lint(target, source, env):
    with _open_log("lint") as log:
        _pnpm_install_if_needed(log)
        # Mesmos gates estáticos de `.github/workflows/company.yml`.
        _run([PNPM, "run", "check"], log=log)
        _run([PNPM, "exec", "oxlint"], log=log)
        # `typecheck` = paraglide compile + tsr generate + tsc --noEmit
        _run([PNPM, "run", "typecheck"], log=log)
    print("\n>> log completo (limpo) em .scons-logs/lint.txt")


def _action_format(target, source, env):
    with _open_log("format") as log:
        _pnpm_install_if_needed(log)
        _run([PNPM, "run", "format"], log=log)
    print("\n>> log completo (limpo) em .scons-logs/format.txt")


# ── Tests ─────────────────────────────────────────────────────────────────────


def _run_suite(log, *, coverage: bool):
    """Suíte do app: vitest.

    `exec vitest run` (não `run test --`): `pnpm run test -- --coverage`
    repassa o "--" literal pro vitest em vez de servir só de separador — a
    cobertura nunca ativava.

    Com ``coverage=True``, ativa --coverage no vitest (relatório em coverage/).
    """
    _pnpm_install_if_needed(log)
    test_cmd = [PNPM, "exec", "vitest", "run"]
    if coverage:
        test_cmd.append("--coverage")
    _run(test_cmd, log=log)


def _action_tests(target, source, env):
    with _open_log("tests") as log:
        _run_suite(log, coverage=False)
    print("\n>> log completo (limpo) em .scons-logs/tests.txt")


def _action_coverage(target, source, env):
    with _open_log("coverage") as log:
        _run_suite(log, coverage=True)
    print("\n>> log completo (limpo) em .scons-logs/coverage.txt")
    print(">> cobertura HTML: coverage/index.html")


# ── Update (deps) ─────────────────────────────────────────────────────────────


def _action_update(target, source, env):
    """Atualiza as dependências do repositório.

    Default: `pnpm update` fica dentro dos ranges do package.json; o uv respeita
    os constraints do pyproject.toml (tooling de utils/, pin do Python intocado).

    `scons update --latest`: `pnpm update --latest` ignora os ranges do
    package.json e cruza majors (reescreve o package.json com a versão mais
    nova de cada pacote) — uso preparatório de migração grande, nunca rotina;
    depois é revisão manual por pacote major-bumped contra changelog/docs. Do
    lado Python, `uv lock --upgrade` já resolve pro mais novo permitido pelos
    `>=` sem teto do pyproject.toml (não há range a "ignorar" lá).

    Não roda lint/tests ao final: o gate continua sendo
    `scons lint && scons tests`, manual, depois de revisar os lockfiles.
    """
    latest = bool(GetOption("latest"))
    pnpm_update_args = ["update", "--latest"] if latest else ["update"]
    with _open_log("update") as log:
        _run([PNPM, *pnpm_update_args], log=log)
        if os.path.isfile(os.path.join(ROOT, "pyproject.toml")):
            _run(["uv", "lock", "--upgrade"], log=log)
            _run(["uv", "sync"], log=log)
    print("\n>> log completo em .scons-logs/update.txt")
    if latest:
        print(
            ">> --latest: ranges/lockfiles ignorados — revise cada dep com "
            "major bump contra changelog/docs antes de commitar"
        )
    else:
        print(">> revise uv.lock / pnpm-lock.yaml antes de commitar")


# ── Clean ─────────────────────────────────────────────────────────────────────


def _action_clean(target, source, env):
    paths = [
        ".output",
        ".nitro",
        "dist",
        "coverage",
        ".vercel/output",
    ]
    for path in paths:
        full = os.path.join(ROOT, path.replace("/", os.sep))
        if os.path.isdir(full):
            shutil.rmtree(full)
            print(f">> removido: {path}")
        elif os.path.isfile(full):
            os.remove(full)
            print(f">> removido: {path}")


# ── Prod (deploy) ─────────────────────────────────────────────────────────────
# `scons prod` — deploy de produção da Company na Vercel (vectora.company). É o
# equivalente local do job de deploy de `.github/workflows/company.yml`, que
# roda sozinho na `master`. A CLI usada é a fixada em `package.json`
# (`pnpm exec vercel`), a mesma do CI.
#
# Requer a Vercel autenticada localmente (`vercel login` ou VERCEL_TOKEN) e o
# repositório já linkado ao projeto (`.vercel/project.json` — gitignored, um
# link por máquina de dev).

VERCEL_PROJECT = "vectora-company"


def _check_vercel_link() -> None:
    """Falha cedo se o diretório não estiver linkado ao projeto Vercel CORRETO.

    `vercel --prod` publica no projeto gravado em `.vercel/project.json`
    (gitignored, um link por máquina de dev). Se o diretório foi linkado ao
    projeto errado — o que acontece se você aceitar o autolink pelo nome da
    pasta em `vercel link` — o deploy vai pro lugar errado E o `scons prod`
    termina "sem erros", enquanto o domínio de produção (vectora.company) segue
    servindo o deploy antigo do projeto certo. Este preflight garante o alvo
    certo.
    """
    import json

    link_path = os.path.join(ROOT, ".vercel", "project.json")
    if not os.path.isfile(link_path):
        print(
            "\n[scons prod] o repositório não está linkado a nenhum projeto Vercel.\n"
            "  Rode na raiz:  pnpm exec vercel link\n"
            f"  e selecione o projeto '{VERCEL_PROJECT}' (não o autolink pelo\n"
            "  nome da pasta).\n"
        )
        raise SystemExit(1)
    with open(link_path, encoding="utf-8") as f:  # noqa: PTH123
        linked = json.load(f).get("projectName", "")
    if linked != VERCEL_PROJECT:
        print(
            "\n[scons prod] repositório linkado ao projeto Vercel ERRADO.\n"
            f"  Linkado:   '{linked}'\n"
            f"  Esperado:  '{VERCEL_PROJECT}'\n"
            "  O deploy iria pro projeto errado e o domínio de produção\n"
            "  continuaria servindo o deploy antigo. Corrija na raiz:\n"
            f"    pnpm exec vercel link    (selecione '{VERCEL_PROJECT}')\n"
        )
        raise SystemExit(1)


def _action_prod(target, source, env):
    # Preflight ANTES de publicar qualquer coisa: projeto Vercel certo, senão o
    # deploy vai pro lugar errado sem erro visível no scons.
    _check_vercel_link()
    with _open_log("prod") as log:
        _pnpm_install_if_needed(log)
        _run([PNPM, "exec", "vercel", "--prod", "--yes"], log=log)
    print("\n>> deploy de produção concluído: vectora.company (Vercel)")
    print(">> log completo em .scons-logs/prod.txt")


# ── Help ──────────────────────────────────────────────────────────────────────


def _action_help(target, source, env):
    sys.stdout.write("""
  Company — alvos SCons  (rodar da raiz do repositório)

  Produto final
    scons prod             deploy de produção na Vercel (vectora.company); confere
                           antes se o diretório está linkado ao projeto certo

  Build
    scons build            build de produção (vite build + Nitro) em .output/

  Qualidade
    scons tests            vitest
    scons coverage         vitest COM relatório de cobertura
    scons lint             prettier --check + oxlint + typecheck (paraglide + tsr + tsc)
    scons format           prettier --write + oxlint --fix
    scons clean            remove .output/, .nitro/, dist/, coverage/ e .vercel/output

  Manutenção
    scons update           atualiza deps: pnpm (app) + uv (tooling de utils/)
    scons update --latest  idem, mas ignora ranges/lockfiles (major bumps) —
                           só antes de migração grande, com revisão manual depois
""")
    sys.stdout.flush()


# ── Alvos SCons ───────────────────────────────────────────────────────────────

env = Environment(ENV=os.environ)
env.Decider("timestamp-match")


def _cmd(name: str, action, deps: list | None = None):
    t = env.Command(f"_{name}", deps or [], action)
    env.AlwaysBuild(t)
    env.Alias(name, t)
    return t


_cmd("build",    _action_build)
_cmd("prod",     _action_prod)

_cmd("tests",    _action_tests)
_cmd("coverage", _action_coverage)
_cmd("lint",     _action_lint)
_cmd("format",   _action_format)
_cmd("update",   _action_update)
_cmd("clean",    _action_clean)
_cmd("help",     _action_help)

Default(env.Command("_default", [], _action_help))
