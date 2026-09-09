import 'package:flutter/material.dart';
import '../theme.dart';

class LanguageToggle extends StatelessWidget {
  final bool isTelugu;
  final ValueChanged<bool> onToggle;

  const LanguageToggle({
    super.key,
    required this.isTelugu,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: NaaguruTheme.surface,
        borderRadius: NaaguruTheme.borderRadius,
        border: Border.all(color: NaaguruTheme.muted.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _LanguageButton(
            text: 'EN',
            isSelected: !isTelugu,
            onTap: () => onToggle(false),
          ),
          Container(
            width: 1,
            height: 24,
            color: NaaguruTheme.muted.withValues(alpha: 0.3),
          ),
          _LanguageButton(
            text: 'తెలుగు',
            isSelected: isTelugu,
            onTap: () => onToggle(true),
          ),
        ],
      ),
    );
  }
}

class _LanguageButton extends StatelessWidget {
  final String text;
  final bool isSelected;
  final VoidCallback onTap;

  const _LanguageButton({
    required this.text,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: NaaguruTheme.borderRadius,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: NaaguruTheme.spacing16,
          vertical: NaaguruTheme.spacing12,
        ),
        // Ensure 48px height touch target
        constraints: const BoxConstraints(minHeight: 48),
        alignment: Alignment.center,
        color: isSelected ? NaaguruTheme.primaryLight : Colors.transparent,
        child: Text(
          text,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.text,
          ),
        ),
      ),
    );
  }
}
