import 'dart:io';

final baseDir = Directory(
  '/run/media/hwakins/Program Codes/Javascript_/unseen-nepal/unseen-nepal-frontend/sql',
);

typedef FileSet = Set<File>;

void main() {
  Directory.current = baseDir;

  print('🚀 Generating SQL bundles...\n');

  /// Priority modules (ONLY where order matters)
  final priority = {
    'schema': [
      "extensions", // contains type definitions
      "users",
      "destinations",
      "guides",
      "stories",
      "bookings",
      "admin-analytics",
    ],
    'views': ['all-views'],
    'rpc': ['app-rpc'],
    'rls': <String>[],
    'triggers': <String>[],
  };

  final outputs = {
    'schema': 'full-schema.sql',
    'views': 'full-views.sql',
    'rpc': 'full-rpc.sql',
    'rls': 'full-rls.sql',
    'triggers': 'full-triggers.sql',
  };

  /// Main aggregate file
  final mainFile = File('full-copy-paste.sql');

  if (mainFile.existsSync()) {
    mainFile.writeAsStringSync('''
/*
========================================================================
Auto Generated Aggregate SQL File: full-copy-paste.sql
Generated at: ${DateTime.now().toUtc()}
Source: All .sql files in schema, rpc, rls, triggers directories

DO NOT EDIT MANUALLY - EDIT THE SOURCE SQL FILES INSTEAD

AUTHOR: UTSAV POKHAREL
========================================================================
*/
''');
  }

  for (var key in outputs.keys) {
    final Set<File> files = collectFiles(key, priority[key]!);

    final buffer = StringBuffer()
      ..writeln(makeHeader(outputs[key]!))
      ..writeln(generateDropStatements(key, files) + '\n');

    for (var f in files) {
      buffer
        ..writeln('-- FILE: ${relative(f.path)}')
        ..writeln(f.readAsStringSync())
        ..writeln();
    }

    File(outputs[key]!).writeAsStringSync(buffer.toString());
    mainFile.writeAsStringSync(buffer.toString(), mode: FileMode.append);
  }

  print('✅ Done.');
}

FileSet collectFiles(String dir, List<String> priorityModules) {
  final packageDir = Directory(dir);

  if (!packageDir.existsSync()) {
    print('Missing dir: $dir');
    return {};
  }

  final ordered = <File>[];
  final seen = <String>{};

  void addFile(File f) {
    final path = f.absolute.path;
    if (!seen.contains(path)) {
      seen.add(path);
      ordered.add(f);
    }
  }

  /// PRIORITY FIRST
  for (var module in priorityModules) {
    final resolved = Directory('${packageDir.path}/$module').absolute.path;

    final entity = FileSystemEntity.typeSync(resolved);

    if (entity == FileSystemEntityType.file) {
      addFile(File(resolved));
    } else if (entity == FileSystemEntityType.directory) {
      for (var f in getSqlFiles(resolved)) {
        addFile(f);
      }
    } else if (File('$resolved.sql').existsSync()) {
      addFile(File('$resolved.sql'));
    } else {
      print('⚠️ Not found: $module');
    }
  }

  /// ALL FILES
  /// For RPC, we intentionally use ONLY priority files so legacy modules
  /// can stay in repo as references without being emitted in bundles.
  if (dir != 'rpc') {
    for (var f in getSqlFiles(packageDir.path)) {
      addFile(f);
    }
  }

  /// ADMIN MODULE FILES (sql/admin/<dir>/...)
  final adminDir = Directory('admin/$dir');
  if (adminDir.existsSync()) {
    for (var f in getSqlFiles(adminDir.path)) {
      addFile(f);
    }
  }

  return ordered.toSet();
}

/// Get all SQL files recursively
List<File> getSqlFiles(String path) {
  final dir = Directory(path);

  if (!dir.existsSync()) return [];

  return dir
      .listSync(recursive: true)
      .whereType<File>()
      .where((f) => f.path.endsWith('.sql'))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));
}

/// Generate DROP statements
String generateDropStatements(String type, FileSet files) {
  final content = files.map((f) => f.readAsStringSync()).join('\n');

  switch (type) {
    case 'schema':
      final tables = extract(r'CREATE TABLE (?:public\.)?([a-zA-Z0-9_]+)', content);

      final types = extract(r'CREATE TYPE (?:public\.)?([a-zA-Z0-9_]+)', content);

      final domains = extract(r'CREATE DOMAIN (?:public\.)?([a-zA-Z0-9_]+)', content);

      final views = extract(
        r'CREATE (?:OR REPLACE )?VIEW (?:public\.)?([a-zA-Z0-9_]+)',
        content,
      );

      return """
/*
----------------------------------------------------------------------------------------------------------------------------------
- AUTO-GENERATED DROP STATEMENTS FOR SCHEMA OBJECTS
-
- Order matters:
- 1. Tables (depend on types)
- 2. Domains
- 3. Types (ENUMS)
-
- WARNING: Dropping these will cause DATA LOSS. Backup before running.
----------------------------------------------------------------------------------------------------------------------------------

*/
-- TABLES
${tables.map((t) => 'DROP TABLE IF EXISTS public.$t CASCADE;').join('\n')}

-- DOMAINS
${domains.map((d) => 'DROP DOMAIN IF EXISTS $d CASCADE;').join('\n')}

-- TYPES
${types.map((t) => 'DROP TYPE IF EXISTS $t CASCADE;').join('\n')}

-- VIEWS
${views.map((v) => 'DROP VIEW IF EXISTS public.$v CASCADE;').join('\n')}

""";

    case 'rpc':
      final matches = RegExp(
        r'CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)',
        caseSensitive: false,
      ).allMatches(content);

      final drops = matches.map((m) {
        final name = m.group(1);
        final rawArgs = m.group(2)!;
        final typesOnly = extractParamTypes(rawArgs);

        return 'DROP FUNCTION IF EXISTS public.$name($typesOnly) CASCADE;';
      }).toSet();

      return drops.join('\n');

    case 'rls':
      final matches = RegExp(
        r'CREATE POLICY "([^"]+)" ON (public\.[a-zA-Z0-9_]+)',
        caseSensitive: false,
      ).allMatches(content);

      return matches
          .map((m) => 'DROP POLICY IF EXISTS "${m[1]}" ON ${m[2]} CASCADE;')
          .toSet()
          .join('\n');

    case 'triggers':
      final matches = RegExp(
        r'CREATE TRIGGER\s+([a-zA-Z0-9_]+)[\s\S]*?\s+ON\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)',
        caseSensitive: false,
      ).allMatches(content);

      return matches
          .map((m) {
            final trigger = m.group(1);
            final table = m.group(2);

            return 'DROP TRIGGER IF EXISTS $trigger ON $table CASCADE;';
          })
          .toSet()
          .join('\n');

    default:
      return '';
  }
}

/// Extract unique matches
Set<String> extract(String pattern, String content) {
  return RegExp(
    pattern,
    caseSensitive: false,
  ).allMatches(content).map((m) => m.group(1)!).toSet();
}

/// Header
String makeHeader(String fileName) =>
    '''

/*
============================================================
AUTO-GENERATED FILE: $fileName
Generated at: ${DateTime.now().toUtc()}
Source: All .sql files in ${fileName.replaceAll("full-", "").replaceAll(".sql", "")} directory

DO NOT EDIT MANUALLY - EDIT THE SOURCE SQL FILES INSTEAD

Description: This file contains the combined SQL.
Generated by sql-gen.dart script
============================================================
*/
''';

/// Clean relative path
String relative(String path) {
  return path.replaceFirst(Directory.current.path + '/', '');
}

String extractParamTypes(String rawArgs) {
  if (rawArgs.trim().isEmpty) return '';

  final sanitizedArgs = _stripSqlComments(rawArgs);

  return _splitSqlArgs(
    sanitizedArgs,
  ).map(_extractSingleParamType).where((t) => t.isNotEmpty).join(', ');
}

String _stripSqlComments(String input) {
  final out = StringBuffer();
  var i = 0;
  var inSingleQuote = false;

  while (i < input.length) {
    final ch = input[i];
    final next = i + 1 < input.length ? input[i + 1] : '';

    if (inSingleQuote) {
      out.write(ch);

      if (ch == "'") {
        // SQL escaped quote: ''
        if (next == "'") {
          out.write(next);
          i += 2;
          continue;
        }

        inSingleQuote = false;
      }

      i++;
      continue;
    }

    if (ch == "'") {
      inSingleQuote = true;
      out.write(ch);
      i++;
      continue;
    }

    // Line comment: -- ...\n
    if (ch == '-' && next == '-') {
      i += 2;
      while (i < input.length && input[i] != '\n') {
        i++;
      }
      continue;
    }

    // Block comment: /* ... */
    if (ch == '/' && next == '*') {
      i += 2;
      while (i + 1 < input.length && !(input[i] == '*' && input[i + 1] == '/')) {
        i++;
      }
      if (i + 1 < input.length) {
        i += 2;
      }
      continue;
    }

    out.write(ch);
    i++;
  }

  return out.toString();
}

List<String> _splitSqlArgs(String rawArgs) {
  final args = <String>[];
  final buffer = StringBuffer();
  var depth = 0;
  var inSingleQuote = false;

  for (var i = 0; i < rawArgs.length; i++) {
    final ch = rawArgs[i];

    if (ch == "'" && (i == 0 || rawArgs[i - 1] != r'\')) {
      inSingleQuote = !inSingleQuote;
      buffer.write(ch);
      continue;
    }

    if (!inSingleQuote) {
      if (ch == '(') depth++;
      if (ch == ')' && depth > 0) depth--;

      if (ch == ',' && depth == 0) {
        final part = buffer.toString().trim();
        if (part.isNotEmpty) args.add(part);
        buffer.clear();
        continue;
      }
    }

    buffer.write(ch);
  }

  final tail = buffer.toString().trim();
  if (tail.isNotEmpty) args.add(tail);

  return args;
}

String _stripDefaultClause(String param) {
  final lower = param.toLowerCase();
  final idx = lower.indexOf(' default ');
  if (idx == -1) return param.trim();
  return param.substring(0, idx).trim();
}

String _extractSingleParamType(String rawParam) {
  var param = _stripDefaultClause(rawParam.trim());
  if (param.isEmpty) return '';

  param = param.replaceFirst(
    RegExp(r'^(inout|in|out|variadic)\s+', caseSensitive: false),
    '',
  );

  final tokens = param.split(RegExp(r'\s+')).where((t) => t.isNotEmpty).toList();
  if (tokens.isEmpty) return '';
  if (tokens.length == 1) return tokens.first;

  // Common declaration pattern: <param_name> <type...>
  return tokens.sublist(1).join(' ');
}
