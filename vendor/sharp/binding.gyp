{
  'targets': [{
    'target_name': 'libvips-cpp',
    'conditions': [
      ['OS == "win"', {
        # Build libvips C++ binding for Windows due to MSVC std library ABI changes
        'type': 'shared_library',
        'defines': [
          'VIPS_CPLUSPLUS_EXPORTS',
          '_ALLOW_KEYWORD_MACROS'
        ],
        'sources': [
          'src/libvips/cplusplus/VError.cpp',
          'src/libvips/cplusplus/VInterpolate.cpp',
          'src/libvips/cplusplus/VImage.cpp'
        ],
        'include_dirs': [
          'vendor/include',
          'vendor/include/glib-2.0',
          'vendor/lib/glib-2.0/include'
        ],
        'libraries': [
          '../vendor/lib/libvips.lib',
          '../vendor/lib/libglib-2.0.lib',
          '../vendor/lib/libgobject-2.0.lib'
        ],
        'configurations': {
          'Release': {
            'msvs_settings': {
              'VCCLCompilerTool': {
                'ExceptionHandling': 1
              }
            },
            'msvs_disabled_warnings': [
              4275
            ]
          }
        }
      }, {
        # Ignore this target for non-Windows
        'type': 'none'
      }]
    ]
  }, {
    'target_name': 'sharp',
    'dependencies': [
      'libvips-cpp'
    ],
    'variables': {
      'runtime_link%': 'shared',
      'conditions': [
        ['OS != "win"', {
          'pkg_config_path': '<!(node -e "console.log(require(\'./lib/libvips\').pkgConfigPath())")',
          'use_global_libvips': '<!(node -e "console.log(Boolean(require(\'./lib/libvips\').useGlobalLibvips()).toString())")'
        }, {
          'pkg_config_path': '',
          'use_global_libvips': ''
        }]
      ]
    },
    'sources': [
      'src/common.cc',
      'src/metadata.cc',
      'src/stats.cc',
      'src/operations.cc',
      'src/pipeline.cc',
      'src/sharp.cc',
      'src/utilities.cc'
    ],
    'include_dirs': [
      '<!(node -e "require(\'nan\')")'
    ],
    'conditions': [
      ['use_global_libvips == "true"', {
        # Use pkg-config for include and lib
        'include_dirs': ['<!@(PKG_CONFIG_PATH="<(pkg_config_path)" pkg-config --cflags-only-I vips-cpp vips glib-2.0 | sed s\/-I//g)'],
        'conditions': [
          ['runtime_link == "static"', {
            'libraries': ['<!@(PKG_CONFIG_PATH="<(pkg_config_path)" pkg-config --libs --static vips-cpp)']
          }, {
            'libraries': ['<!@(PKG_CONFIG_PATH="<(pkg_config_path)" pkg-config --libs vips-cpp)']
          }],
          ['OS == "linux"', {
            'defines': [
              # Inspect libvips-cpp.so to determine which C++11 ABI version was used and set _GLIBCXX_USE_CXX11_ABI accordingly. This is quite horrible.
              '_GLIBCXX_USE_CXX11_ABI=<!(if readelf -Ws "$(PKG_CONFIG_PATH="<(pkg_config_path)" pkg-config --variable libdir vips-cpp)/libvips-cpp.so" | c++filt | grep -qF __cxx11;then echo "1";else echo "0";fi)'
            ]
          }]
        ]
      }, {
        # Use pre-built libvips stored locally within node_modules
        'conditions': [
          ['OS == "win"', {
            'include_dirs': [
              'vendor/include',
              'vendor/include/glib-2.0',
              'vendor/lib/glib-2.0/include'
            ],
            'defines': [
              '_ALLOW_KEYWORD_MACROS',
              '_FILE_OFFSET_BITS=64'
            ],
            'libraries': [
              '../vendor/lib/libvips.lib',
              '../vendor/lib/libglib-2.0.lib',
              '../vendor/lib/libgobject-2.0.lib'
            ]
          }],
          ['OS == "mac"', {
            'include_dirs': [
              'vendor/include',
              'vendor/include/glib-2.0'
            ],
            'libraries': [
              '../vendor/lib/libvips-cpp.42.dylib',
              '../vendor/lib/libvips.42.dylib',
              '../vendor/lib/libglib-2.0.0.dylib',
              '../vendor/lib/libgobject-2.0.0.dylib',
              # Ensure runtime linking is relative to sharp.node
              '-rpath \'@loader_path/../../vendor/lib\''
            ]
          }],
          ['OS == "linux"', {
            'defines': [
              '_GLIBCXX_USE_CXX11_ABI=0'
            ],
            'include_dirs': [
              'vendor/include',
              '<!@(PKG_CONFIG_PATH="<(pkg_config_path)" pkg-config --cflags-only-I glib-2.0 | sed s\/-I//g)'
            ],
            'libraries': [
              '../vendor/lib/libvips-cpp.so.42',
              '../vendor/lib/libvips.so.42',
              '../vendor/lib/libexif.so.12',
              '../vendor/lib/libgif.so.7',
              '../vendor/lib/libjpeg.so.8',
              '../vendor/lib/liblcms2.so.2',
              '../vendor/lib/libopenjp2.so.7',
              '../vendor/lib/libpng16.so.16',
              '../vendor/lib/libtiff.so.5',
              '../vendor/lib/libwebp.so.7',
              '../vendor/lib/libwebpdemux.so.2',
              '../vendor/lib/libwebpmux.so.3',
              '../vendor/lib/libde265.so.0',
              '../vendor/lib/libheif.so.1',
              '../vendor/lib/libMagickCore-6.Q16.so.6',
              '../vendor/lib/libpoppler-glib.so.8',
              '../vendor/lib/libpoppler.so.91',
              # Ensure runtime linking is relative to sharp.node
              '-Wl,--disable-new-dtags -Wl,-rpath=\'$${ORIGIN}/../../vendor/lib\''
            ]
          }]
        ]
      }]
    ],
    'cflags_cc': [
      '-std=c++0x',
      '-fexceptions',
      '-Wall',
      '-O3'
    ],
    'xcode_settings': {
      'CLANG_CXX_LANGUAGE_STANDARD': 'c++11',
      'CLANG_CXX_LIBRARY': 'libc++',
      'MACOSX_DEPLOYMENT_TARGET': '10.10',
      'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
      'GCC_ENABLE_CPP_RTTI': 'YES',
      'OTHER_CPLUSPLUSFLAGS': [
        '-fexceptions',
        '-Wall',
        '-O3'
      ]
    },
    'configurations': {
      'Release': {
        'cflags_cc': [
          '-Wno-cast-function-type'
        ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'ExceptionHandling': 1
          }
        },
        'msvs_disabled_warnings': [
          4275
        ]
      }
    },
  }]
}
