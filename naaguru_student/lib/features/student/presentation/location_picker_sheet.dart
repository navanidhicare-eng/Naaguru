import 'dart:async';
import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';

// Shared Stitch-palette extras (same constants as Screen 1).
class _C {
  static const surfaceContainer = Color(0xFFE3F1ED);
  static const surfaceContainerHigh = Color(0xFFDDEBE7);
}

/// A polished bottom-sheet that lets the student pick one [CatalogLocation]
/// from a searchable list.
///
/// Used for STATE, DISTRICT, MANDAL, and LOCALITY selection.
/// Loads the list asynchronously via [loader] when first shown.
///
/// Returns the chosen [CatalogLocation] via [Navigator.pop], or null if
/// the user dismisses without selecting.
class LocationPickerSheet extends StatefulWidget {
  /// Human-readable level label, e.g. "State", "District".
  final String levelLabel;

  /// Telugu label for the level.
  final String levelLabelTe;

  /// Whether the UI is in Telugu mode.
  final bool isTelugu;

  /// Async callback that fetches the location list.
  final Future<List<CatalogLocation>> Function() loader;

  /// Pre-selected location (shown highlighted).
  final CatalogLocation? current;

  const LocationPickerSheet({
    super.key,
    required this.levelLabel,
    required this.levelLabelTe,
    required this.isTelugu,
    required this.loader,
    this.current,
  });

  /// Convenience method: show the sheet and return the chosen location or null.
  static Future<CatalogLocation?> show(
    BuildContext context, {
    required String levelLabel,
    required String levelLabelTe,
    required bool isTelugu,
    required Future<List<CatalogLocation>> Function() loader,
    CatalogLocation? current,
  }) {
    return showModalBottomSheet<CatalogLocation>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: NaaguruTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => LocationPickerSheet(
        levelLabel: levelLabel,
        levelLabelTe: levelLabelTe,
        isTelugu: isTelugu,
        loader: loader,
        current: current,
      ),
    );
  }

  @override
  State<LocationPickerSheet> createState() => _LocationPickerSheetState();
}

class _LocationPickerSheetState extends State<LocationPickerSheet> {
  List<CatalogLocation> _all = [];
  List<CatalogLocation> _filtered = [];
  bool _loading = true;
  bool _error = false;
  final TextEditingController _search = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _load();
    _search.addListener(_onSearch);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = false;
    });
    try {
      final results = await widget.loader();
      if (mounted) {
        setState(() {
          _all = results;
          _filtered = results;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = true;
        });
      }
    }
  }

  void _onSearch() {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 250), () {
      final q = _search.text.trim().toLowerCase();
      setState(() {
        _filtered = q.isEmpty
            ? _all
            : _all.where((loc) {
                final name = widget.isTelugu && loc.nameTe != null && loc.nameTe!.isNotEmpty
                    ? loc.nameTe!.toLowerCase()
                    : loc.nameEn.toLowerCase();
                return name.contains(q);
              }).toList();
      });
    });
  }

  String _s(String en, String te) => widget.isTelugu ? te : en;

  @override
  Widget build(BuildContext context) {
    final label = widget.isTelugu ? widget.levelLabelTe : widget.levelLabel;

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      expand: false,
      builder: (_, scrollController) {
        return Column(
          children: [
            // Handle.
            const SizedBox(height: 10),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: _C.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 12),

            // Title row.
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      _s('Select $label', '$label ఎంచుకోండి'),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: NaaguruTheme.text,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded,
                        color: NaaguruTheme.muted),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),

            // Search bar.
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
              child: Container(
                height: 44,
                decoration: BoxDecoration(
                  color: _C.surfaceContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const SizedBox(width: 12),
                    Icon(Icons.search_rounded,
                        color: NaaguruTheme.muted, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _search,
                        autofocus: true,
                        style: const TextStyle(
                            fontSize: 14, color: NaaguruTheme.text),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: _s(
                            'Search $label...',
                            '$label వెతకండి...',
                          ),
                          hintStyle: const TextStyle(
                              fontSize: 14, color: NaaguruTheme.muted),
                          isDense: true,
                          contentPadding: EdgeInsets.zero,
                        ),
                      ),
                    ),
                    if (_search.text.isNotEmpty)
                      GestureDetector(
                        onTap: () => _search.clear(),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          child: Icon(Icons.close_rounded,
                              size: 18, color: NaaguruTheme.muted),
                        ),
                      )
                    else
                      const SizedBox(width: 12),
                  ],
                ),
              ),
            ),

            // Divider.
            Container(height: 1, color: _C.surfaceContainerHigh),

            // Content.
            Expanded(
              child: _buildContent(scrollController),
            ),
          ],
        );
      },
    );
  }

  Widget _buildContent(ScrollController controller) {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: NaaguruTheme.primary,
        ),
      );
    }

    if (_error) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.cloud_off_outlined,
                color: NaaguruTheme.muted, size: 36),
            const SizedBox(height: 12),
            Text(
              widget.isTelugu
                  ? 'లొకేషన్లు లోడ్ కాలేదు'
                  : "Couldn't load locations",
              style: const TextStyle(
                  fontSize: 14,
                  color: NaaguruTheme.muted,
                  fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: _load,
              child: Text(
                widget.isTelugu ? 'మళ్లీ ప్రయత్నించండి' : 'Try again',
                style: const TextStyle(color: NaaguruTheme.primary),
              ),
            ),
          ],
        ),
      );
    }

    if (_filtered.isEmpty) {
      return Center(
        child: Text(
          _search.text.trim().isNotEmpty
              ? widget.isTelugu
                  ? 'ఏ ఫలితాలు కనుగొనబడలేదు'
                  : 'No results found'
              : widget.isTelugu
                  ? 'లొకేషన్లు అందుబాటులో లేవు'
                  : 'No locations available',
          style: const TextStyle(fontSize: 14, color: NaaguruTheme.muted),
          textAlign: TextAlign.center,
        ),
      );
    }

    return ListView.separated(
      controller: controller,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: _filtered.length,
      separatorBuilder: (context, index) =>
          Container(height: 1, color: _C.surfaceContainerHigh),
      itemBuilder: (_, i) {
        final loc = _filtered[i];
        final isSelected = loc.id == widget.current?.id;
        final name = widget.isTelugu && loc.nameTe != null && loc.nameTe!.isNotEmpty
            ? loc.nameTe!
            : loc.nameEn;
        return InkWell(
          onTap: () => Navigator.pop(context, loc),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    name,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.w400,
                      color: isSelected
                          ? NaaguruTheme.primary
                          : NaaguruTheme.text,
                    ),
                  ),
                ),
                if (isSelected)
                  const Icon(Icons.check_circle_rounded,
                      color: NaaguruTheme.primary, size: 20),
              ],
            ),
          ),
        );
      },
    );
  }
}
