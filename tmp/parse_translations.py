import json
import subprocess

with open("/tmp/extracted_app.js") as f:
    code = f.read()

def extract_obj(var_name):
    target = var_name + "={"
    p = code.find(target)
    if p == -1:
        target = var_name + " = {"
        p = code.find(target)
    if p == -1:
        return None
    start = code.find("{", p)
    depth = 0
    in_str = False
    quote_char = ""
    escape = False
    for i in range(start, len(code)):
        c = code[i]
        if escape:
            escape = False
            continue
        if c == "\\":
            escape = True
            continue
        if in_str:
            if c == quote_char:
                in_str = False
            continue
        if c in ('"', "'", "`"):
            in_str = True
            quote_char = c
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return code[start:i+1]
    return None

objs = ["Hhe", "The", "Nhe", "Bhe", "Jhe", "rpe", "ipe", "spe", "ope", "npe", "cpe"]
results = {}
for name in objs:
    raw = extract_obj(name)
    if raw:
        print(f"Extracted {name}, length: {len(raw)}")
        js_code = f"""
const Oe = (e, m) => ({{en: e, ml: m}});
const te = (e, m) => ({{en: e, ml: m}});
const obj = {raw};
console.log(JSON.stringify(obj));
"""
        with open("/tmp/eval.js", "w") as ef:
            ef.write(js_code)
        res = subprocess.run(["node", "/tmp/eval.js"], capture_output=True, text=True)
        if res.returncode == 0:
            results[name] = json.loads(res.stdout)
        else:
            print(f"Error evaluating {name}: {res.stderr[:200]}")

with open("/tmp/parsed_translations.json", "w") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("Saved all parsed translations! Keys:", list(results.keys()))
