import os
import subprocess
import threading
import sys
import time


def find_npm():
    for path in os.environ["PATH"].split(os.pathsep):
        potential_path = os.path.join(path, "npm.cmd")
        if os.path.isfile(potential_path):
            return potential_path
    return None

def stream_output(process, prefix=""):
    while True:
        line = process.stdout.readline()
        if not line and process.poll() is not None:
            break
        if line:
            print(f"{prefix}{line}", end='')
            sys.stdout.flush()
    while True:
        line = process.stderr.readline()
        if not line and process.poll() is not None:
            break
        if line:
            print(f"{prefix}(ERR) {line}", end='')
            sys.stdout.flush()

def run_servers():
    base_path = os.getcwd()
    backend_path = os.path.join(base_path, "backend", "langrise_project")
    frontend_path = os.path.join(base_path, "frontend", "langrise-app")
    if not os.path.isdir(backend_path):
        print(f"Backend path not found: {backend_path}")
        sys.exit(1)
    if not os.path.isdir(frontend_path):
        print(f"Frontend path not found: {frontend_path}")
        sys.exit(1)
    django_env = os.environ.copy()
    django_env["PYTHONUNBUFFERED"] = "1"
    print("Starting Django development server...")
    django_process = subprocess.Popen(
        [
            sys.executable,
            "-u",
            "manage.py",
            "runserver"
        ],
        cwd=backend_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=django_env,
        bufsize=1
    )
    print("Starting React dev server...")
    react_path = find_npm()
    react_process = subprocess.Popen(
        f"{react_path} run dev",
        cwd=frontend_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    django_thread = threading.Thread(target=stream_output, args=(django_process, "Django: "))
    react_thread = threading.Thread(target=stream_output, args=(react_process, "React: "))
    django_thread.start()
    react_thread.start()
    try:
        while True:
            django_code = django_process.poll()
            react_code = react_process.poll()
            if django_code is not None:
                print(f"\nDjango server stopped with exit code {django_code}.")
                break
            if react_code is not None:
                print(f"\nReact server stopped with exit code {react_code}.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nReceived KeyboardInterrupt, stopping servers...")
        django_process.terminate()
        react_process.terminate()
    finally:
        django_thread.join()
        react_thread.join()
        django_process.wait()
        react_process.wait()
        print("Servers have been stopped.")

if __name__ == "__main__":
    run_servers()
