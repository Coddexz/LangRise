import os
import platform
from typing import Union
import re


def main() -> None:
    if platform.system() == 'Windows':
        npm_path = find_path(final_file_name='npm.cmd')
        venv_path = find_path(final_file_name='python.exe')
    else:
        npm_path = find_path(final_file_name='npm')
        venv_path = find_path(final_file_name='python')

    if npm_path is None:
        print("npm.cmd not found.")
        raise FileNotFoundError("npm not found.")
    elif venv_path is None:
        raise FileNotFoundError("python (venv) not found.")

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


def find_path(final_file_name: str) -> Union[str, None]:
    for path in os.environ["PATH"].split(os.pathsep):
        potential_path = os.path.join(path, final_file_name)
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
        os.system(f'gnome-terminal -- bash -c "{command}; exec bash"')

def open_browser_in_incognito(url: str, browser: str = 'chrome') -> None:
    system = platform.system()
    if system == 'Windows':
        os.system(f'start {browser} --incognito "{url}"')
    elif system == 'Linux':
        browser = 'google-chrome' if browser == 'chrome' else browser
        os.system(f'{browser} --incognito "{url}" &')
    elif system == 'Darwin':  # macOS
        os.system(f'open -na "Google Chrome" --args --incognito "{url}"')
    else:
        raise OSError(f"Unsupported operating system: {system}")


if __name__ == "__main__":
    main()