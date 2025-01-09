import os
import platform
from typing import Union
import re


def main() -> None:
    npm_path = find_npm()
    venv_path = find_venv()

    if npm_path is None:
        print("npm.cmd not found.")
        raise SystemExit(1)
    elif venv_path is None:
        print("Virtual environment not found.")
        print(venv_path)
        raise SystemExit(1)
    else:
        print("Starting Django development server...")
        manage_py_path = os.path.join(os.getcwd(), "backend", "langrise_project", "manage.py")
        start_server(f'{venv_path} {manage_py_path} runserver')

        print("Starting React dev server...")
        frontend_path = os.path.join(os.getcwd(), "frontend", "langrise-app")
        start_server(f'cd {frontend_path} && {npm_path} run dev'.replace("'", '"'))

        print('Servers are running.')

        print('Opening browser in incognito mode...')
        open_browser_in_incognito("http://localhost:5173")
        print('Done.')

def find_venv() -> Union[str, None]:
    for path in os.environ["PATH"].split(os.pathsep):
        potential_path = os.path.join(path, "python.exe")
        if os.path.isfile(potential_path):
            if re.search(r'\s', potential_path):
                potential_path = escape_spaces_in_path(potential_path)
            return potential_path
    return None

def find_npm() -> Union[str, None]:
    for path in os.environ["PATH"].split(os.pathsep):
        potential_path = os.path.join(path, "npm.cmd")
        if os.path.isfile(potential_path):
            if re.search(r'\s', potential_path):
                potential_path = escape_spaces_in_path(potential_path)
            return potential_path
    return None

def escape_spaces_in_path(string: str) -> str:
    pattern = r'([^\\]*\s[^\\]*)'
    return re.sub(pattern, r'"\1"', string)

def start_server(command: str) -> None:
    if platform.system() == 'Windows':
        os.system(f'start cmd /k "{command}"')
    else:
        os.system(f'start sh -c "{command}"')

def open_browser_in_incognito(url: str, browser: str = 'chrome') -> None:
    system = platform.system()
    if system == 'Windows':
        os.system(f'start {browser} --incognito "{url}"')
    elif system == 'Linux':
        os.system(f'{browser} --incognito "{url}" &')
    elif system == 'Darwin':  # macOS
        os.system(f'open -na "Google Chrome" --args --incognito "{url}"')
    else:
        raise OSError(f"Unsupported operating system: {system}")


if __name__ == "__main__":
    main()