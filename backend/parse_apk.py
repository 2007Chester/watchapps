#!/usr/bin/env python3
"""
Скрипт для парсинга APK файлов и извлечения информации о версии, SDK и совместимости
"""
import sys
import json
import zipfile
import re
import subprocess
import os
import xml.etree.ElementTree as ET

# Пытаемся импортировать библиотеку для парсинга AXML
try:
    from axmlparserpy.axmlparserpy import AXML
    HAS_AXML_PARSER = True
except ImportError:
    try:
        from axmlparserpy import AXML
        HAS_AXML_PARSER = True
    except ImportError:
        HAS_AXML_PARSER = False

def parse_apk_with_aapt(apk_path):
    """Пытается использовать aapt для парсинга APK"""
    aapt_paths = ['aapt', 'aapt2', '/usr/bin/aapt', '/usr/local/bin/aapt']
    
    for aapt in aapt_paths:
        try:
            result = subprocess.run(
                [aapt, 'dump', 'badging', apk_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0 and result.stdout:
                output = result.stdout
                data = {}
                
                # Парсим versionName
                match = re.search(r"versionName=['\"]([^'\"]+)['\"]", output)
                if match:
                    data['version'] = match.group(1)
                
                # Парсим package name
                match = re.search(r"package: name=['\"]([^'\"]+)['\"]", output)
                if match:
                    data['package_name'] = match.group(1)
                
                # Парсим minSdkVersion или sdkVersion
                match = re.search(r"(?:minSdkVersion|sdkVersion):['\"](\d+)['\"]", output)
                if match:
                    data['min_sdk'] = int(match.group(1))
                
                # Парсим targetSdkVersion
                match = re.search(r"targetSdkVersion:['\"](\d+)['\"]", output)
                if match:
                    data['target_sdk'] = int(match.group(1))
                
                # Парсим maxSdkVersion
                match = re.search(r"maxSdkVersion:['\"](\d+)['\"]", output)
                if match:
                    data['max_sdk'] = int(match.group(1))
                
                # Определяем минимальную совместимую версию Wear OS на основе min_sdk
                # min_sdk определяет минимальную версию, с которой приложение совместимо
                sdk_level = data.get('min_sdk')
                if sdk_level:
                    if sdk_level >= 35:
                        # API 35+ (Android 15+) → Wear OS 5.1+
                        data['wear_os_version'] = 'Wear OS 5.1+'
                    elif sdk_level >= 34:
                        # API 34 (Android 14) → Wear OS 5.0+
                        data['wear_os_version'] = 'Wear OS 5.0+'
                    elif sdk_level >= 30:
                        # API 30-33 (Android 11-13) → Wear OS 4.0+
                        data['wear_os_version'] = 'Wear OS 4.0+'
                    elif sdk_level >= 28:
                        # API 28-29 (Android 9-10) → Wear OS 3.0+
                        data['wear_os_version'] = 'Wear OS 3.0+'
                    elif sdk_level >= 25:
                        # API 25-27 (Android 7.1-8.1) → Wear OS 2.0+
                        data['wear_os_version'] = 'Wear OS 2.0+'
                    elif sdk_level >= 23:
                        # API 23-24 (Android 6.0-7.0) → Wear OS 1.0+
                        data['wear_os_version'] = 'Wear OS 1.0+'
                    else:
                        data['wear_os_version'] = 'Not compatible'
                
                return data
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError):
            continue
    
    return None

def parse_apk_with_zip(apk_path):
    """Парсит APK через ZIP архив"""
    data = {}
    
    try:
        with zipfile.ZipFile(apk_path, 'r') as zip_file:
            # Пытаемся найти AndroidManifest.xml
            try:
                manifest = zip_file.read('AndroidManifest.xml')
                
                # Если есть библиотека для парсинга AXML, используем её
                if HAS_AXML_PARSER:
                    try:
                        parser = AXML(manifest)
                        xml_content = parser.get_xml()
                        root = ET.fromstring(xml_content)
                        
                        # Парсим versionName из атрибутов manifest (пробуем разные варианты namespace)
                        android_ns = '{http://schemas.android.com/apk/res/android}'
                        version_name = root.get(android_ns + 'versionName') or root.get('android:versionName') or root.get('versionName')
                        if version_name:
                            data['version'] = version_name
                        
                        # Парсим package name
                        package_name = root.get('package')
                        if package_name:
                            data['package_name'] = package_name
                        
                        # Парсим uses-sdk (может быть в разных местах)
                        uses_sdk = root.find('.//uses-sdk')
                        if uses_sdk is None:
                            # Пробуем найти в корневом элементе
                            if root.tag == 'manifest':
                                uses_sdk = root
                        
                        if uses_sdk is not None:
                            min_sdk = (uses_sdk.get(android_ns + 'minSdkVersion') or 
                                      uses_sdk.get('android:minSdkVersion') or 
                                      uses_sdk.get('minSdkVersion'))
                            if min_sdk:
                                try:
                                    data['min_sdk'] = int(min_sdk)
                                    # Определяем минимальную совместимую версию Wear OS на основе min_sdk
                                    sdk_level = data['min_sdk']
                                    if sdk_level >= 35:
                                        data['wear_os_version'] = 'Wear OS 5.1+'
                                    elif sdk_level >= 34:
                                        data['wear_os_version'] = 'Wear OS 5.0+'
                                    elif sdk_level >= 30:
                                        data['wear_os_version'] = 'Wear OS 4.0+'
                                    elif sdk_level >= 28:
                                        data['wear_os_version'] = 'Wear OS 3.0+'
                                    elif sdk_level >= 25:
                                        data['wear_os_version'] = 'Wear OS 2.0+'
                                    elif sdk_level >= 23:
                                        data['wear_os_version'] = 'Wear OS 1.0+'
                                    else:
                                        data['wear_os_version'] = 'Not compatible'
                                except ValueError:
                                    pass
                            
                            target_sdk = (uses_sdk.get(android_ns + 'targetSdkVersion') or 
                                         uses_sdk.get('android:targetSdkVersion') or 
                                         uses_sdk.get('targetSdkVersion'))
                            if target_sdk:
                                try:
                                    data['target_sdk'] = int(target_sdk)
                                except ValueError:
                                    pass
                            
                            max_sdk = (uses_sdk.get(android_ns + 'maxSdkVersion') or 
                                      uses_sdk.get('android:maxSdkVersion') or 
                                      uses_sdk.get('maxSdkVersion'))
                            if max_sdk:
                                try:
                                    data['max_sdk'] = int(max_sdk)
                                except ValueError:
                                    pass
                        
                        # Если получили хотя бы одно значение, возвращаем данные
                        if data:
                            return data
                    except Exception as e:
                        # Если парсинг через библиотеку не удался, пробуем другие методы
                        import traceback
                        print(f"AXML parser error: {e}", file=sys.stderr)
                        traceback.print_exc(file=sys.stderr)
                
                # Альтернативный метод: ищем в бинарных данных через регулярные выражения
                # Это менее надежно, но может работать для некоторых APK
                manifest_str = manifest.decode('latin-1', errors='ignore')
                
                # Ищем versionName (может быть в разных форматах)
                patterns = [
                    r'versionName[\x00-\x1F\x20]*([0-9]+\.[0-9]+(?:\.[0-9]+)?(?:\.[0-9]+)?)',
                    r'versionName["\']([^"\']+)["\']',
                ]
                for pattern in patterns:
                    match = re.search(pattern, manifest_str)
                    if match:
                        data['version'] = match.group(1)
                        break
                
                # Ищем minSdkVersion (может быть как число или строка)
                patterns = [
                    r'minSdkVersion[\x00-\x1F\x20]*(\d+)',
                    r'minSdkVersion["\'](\d+)["\']',
                ]
                for pattern in patterns:
                    match = re.search(pattern, manifest_str)
                    if match:
                        data['min_sdk'] = int(match.group(1))
                        # Определяем минимальную совместимую версию Wear OS на основе min_sdk
                        sdk_level = data.get('min_sdk')
                        if sdk_level >= 35:
                            data['wear_os_version'] = 'Wear OS 5.1+'
                        elif sdk_level >= 34:
                            data['wear_os_version'] = 'Wear OS 5.0+'
                        elif sdk_level >= 30:
                            data['wear_os_version'] = 'Wear OS 4.0+'
                        elif sdk_level >= 28:
                            data['wear_os_version'] = 'Wear OS 3.0+'
                        elif sdk_level >= 25:
                            data['wear_os_version'] = 'Wear OS 2.0+'
                        elif sdk_level >= 23:
                            data['wear_os_version'] = 'Wear OS 1.0+'
                        else:
                            data['wear_os_version'] = 'Not compatible'
                        break
                
                # Ищем targetSdkVersion
                patterns = [
                    r'targetSdkVersion[\x00-\x1F\x20]*(\d+)',
                    r'targetSdkVersion["\'](\d+)["\']',
                ]
                for pattern in patterns:
                    match = re.search(pattern, manifest_str)
                    if match:
                        data['target_sdk'] = int(match.group(1))
                        break
                
                # Ищем maxSdkVersion
                patterns = [
                    r'maxSdkVersion[\x00-\x1F\x20]*(\d+)',
                    r'maxSdkVersion["\'](\d+)["\']',
                ]
                for pattern in patterns:
                    match = re.search(pattern, manifest_str)
                    if match:
                        data['max_sdk'] = int(match.group(1))
                        break
                    
            except KeyError:
                pass
    except (zipfile.BadZipFile, IOError, OSError) as e:
        return None
    
    return data if data else None

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'APK path required'}), file=sys.stderr)
        sys.exit(1)
    
    apk_path = sys.argv[1]
    
    if not os.path.exists(apk_path):
        print(json.dumps({'error': 'APK file not found'}), file=sys.stderr)
        sys.exit(1)
    
    # Сначала пытаемся использовать aapt
    data = parse_apk_with_aapt(apk_path)
    
    # Если не получилось, используем ZIP парсинг
    if not data:
        data = parse_apk_with_zip(apk_path)
    
    # Устанавливаем значения по умолчанию
    result = {
        'success': True,
        'version': data.get('version', '1.0.0') if data else '1.0.0',
        'wear_os_version': data.get('wear_os_version', 'Wear OS 5.0+') if data else 'Wear OS 5.0+',
        'package_name': data.get('package_name') if data else None,
        'min_sdk': data.get('min_sdk') if data else None,
        'max_sdk': data.get('max_sdk') if data else None,
        'target_sdk': data.get('target_sdk') if data else None,
    }
    
    print(json.dumps(result))

if __name__ == '__main__':
    main()

